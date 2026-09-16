import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { TransactionItem, PaymentMethod, SaleTransaction, CartItem } from "@/types/transaction";
import { createInvoiceNumber } from "@/utils/invoice";

type CheckoutInput = {
    items: CartItem[];
    paymentMethod: PaymentMethod;
    paymentAmount: number;
}
type CreateTransactionPayload = {
    items: TransactionItem[];
    total: number;
    paidAmount: number;
    paymentMethod: PaymentMethod;
};

function generateInvoiceNumber() {
    return `TRX-${Date.now()}`;
}

export async function createTransaction(
    payload: CreateTransactionPayload
) {
    const changeAmount = payload.paidAmount - payload.total;

    const transactionCollection = collection(db, "transactions");

    const docRef = await addDoc(transactionCollection, {
        invoiceNumber: generateInvoiceNumber(),
        items: payload.items,
        total: payload.total,
        paidAmount: payload.paidAmount,
        changeAmount,
        paymentMethod: payload.paymentMethod,
        createdAt: serverTimestamp(),
    });

    return docRef.id;
}

export async function getTransactions(uid: string): Promise<SaleTransaction[]> {
    const ref = collection(db, "users", uid, "transactins");
    const snapshot = await getDocs(query(ref, orderBy("createdAt", "desc")));
    return snapshot.docs.map((item) => ({id: item.id, ...item.data()} as SaleTransaction))
}

export async function getSaleTransaction(uid: string, transactionId: string) {
    const snapshot = await getDoc(doc(db, "users", uid, "transactions", transactionId));
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data()} as SaleTransaction;
}

export async function checkout(uid: string, input: CheckoutInput){
    if (input.items.length === 0) throw new Error("Keranjang masih kosong.");

    const total = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if(input.paymentMethod === "cash" && input.paymentAmount < total){
        throw new Error("Uang Pembayaran Masih Kurang.");
    }

    const invoiceNumber = createInvoiceNumber();
    const transactionRef = doc(collection(db, "users", uid, "transactions"));

    await runTransaction(db, async(firestoreTransaction) =>{
        const productSnapshots = await Promise.all(
        input.items.map((item) => 
        firestoreTransaction.get(doc(db, "users", uid, "products", item.productId)))
        );

        productSnapshots.forEach((snapshot, index) => {
            const cartItem = input.items[index];
            if(!snapshot.exists()) throw new Error(`Produk ${cartItem.name} tidak ditemukan`);
            const currentStock = Number(snapshot.data().stock ?? 0);
            if (currentStock < cartItem.quantity){
                throw new Error(`Stok ${cartItem.name} Tidak Mencukupi.`);
            }
        });

        productSnapshots.forEach((snapshot, index) => {
            const cartItem = input.items[index];
            const currentStock = Number(snapshot.data()?.stock ?? 0);
            firestoreTransaction.update(snapshot.ref, {
                stock: currentStock - cartItem.quantity,
                updatedAt: serverTimestamp(),
            });
        });

        const cleanItems = input.items.map(({ productId, name, sku, price, quantity }) => ({
            productId,
            name,
            sku,
            price,
            quantity,
        }));

        firestoreTransaction.set(transactionRef, {
            invoiceNumber,
            items: cleanItems,
            subtotal: total,
            total,
            paymentMethod: input.paymentMethod,
            paymentAmount: input.paymentAmount,
            change: input.paymentMethod === "cash" ? input.paymentAmount - total : 0,
            createdAt: serverTimestamp(),
        });        
    });

    return { transactionId: transactionRef.id, invoiceNumber, total};
}

export async function getTransactionsById(
  uid: string,
  transactionId: string,
): Promise<SaleTransaction | null> {
  const docRef = doc(db, "users", uid, "transactions", transactionId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  } as SaleTransaction;
}
