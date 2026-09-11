import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Product, ProductInput } from "@/types/product";
// import { useState } from "react";
// import { deleteProduct, getProducts } from "@/services/product.service"

function productsCollection(uid: string){
    return collection(db, "users", uid, "products");
}

export async function getProducts(uid: string): Promise<Product[]> {
    const snapshot = await getDocs(query(productsCollection(uid), orderBy("createdAt", "desc")));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data()} as Product));
}

export async function getProdutc(uid: string, productId: string): Promise<Product | null>{
    const snapshot = await getDoc(doc(db, "users", uid, "products", productId));
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Product;
}

export async function createProduct(uid: string, input: ProductInput) {
    await addDoc(productsCollection(uid), {
        ...input,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function updateProduct(
    uid: string,
    productId: string,
    input: ProductInput
){
    return updateDoc(doc(db, "users", uid, "products", productId),{
        ...input,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteProduct(uid: string, productId: string){
    return deleteDoc(doc(db, "users", uid, "products", productId));
}