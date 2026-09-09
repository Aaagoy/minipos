"use client";
import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Trash } from "lucide-react"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProducts } from "@/services/product.service";
import type { Product } from "@/types/product";
import type { CartItem, PaymentMethod } from "@/types/cart";
import { formatRupiah } from "@/utils/format";
import { useRouter } from "next/navigation";
import { createTransaction } from "@/services/transaction.service";

export default function NewTransactionsPage(){
    const [products, setProducts] = useState<Product[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [search, setSearch] = useState("");
    const [discount, setDiscount] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function loadProducts(){
            try {
                setLoading(true);
                const data = await getProducts();
                setProducts(data);
            } finally{
                setLoading(false);
            }
        }
        loadProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const keyword = search.toLocaleLowerCase();
            return(
                product.name.toLocaleLowerCase().includes(keyword) || product.sku.toLocaleLowerCase().includes(keyword)
            );
        });
    }, [products, search]);

    function handleAddToCart(product: Product){
        setCartItems((currentItems) => {
            const existingItem = currentItems.find((item) => item.productId === product.id);
            if(existingItem) {
                return currentItems.map((item) =>
                item.productId === product.id? {
                    ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.price
                }: item);
            }
            return [
                ...currentItems,
                { productId: product.id, name: product.name, price: product.price, qty: 1, subtotal: product.price}
            ];
        });
    }

    function handleUpdateQty(productId: string, qty: number){
        if (qty < 1) return;
        setCartItems((currentItems) =>
            currentItems.map((item)=> item.productId === productId
                ? {...item, qty, subtotal: qty * item.price}: item
                )
            );
        }

    function handleRemoveItem(productId: string){
        setCartItems((currentItems) =>
        currentItems.filter((item) => item.productId !== productId)
    );
    }

    const subtotal = useMemo(() => {
        return cartItems.reduce((total, item) => total + item.subtotal,0)
    }, [cartItems]);
    
    const grandTotal = useMemo(() => {
        return Math.max(subtotal - discount, 0);
    }, [subtotal, discount]);

    // function handleCheckout() {
    //         if(cartItems.length === 0){
    //             alert("Keranjang Masih Kosong");
    //             return;
    //         }
    //         const payload = {
    //             items: cartItems,
    //             subtotal, discount, grandTotal, paymentMethod,
    //         };
    //         console.log("Checkout Payload", payload);
    //         alert("Checkout Berhasil Disiapkan. Lihat Console.");
    //     }

    async function handleCheckout() {
        const transactionId = await createTransaction({
            items: cartItems.map((item) => ({
                productId: item.productId,
                productName: item.name,
                quantity: item.qty,
                price: item.price,
                subtotal: item.subtotal,
            })),
            total: grandTotal,
            paidAmount,
            paymentMethod,
        });
        router.push("/transactions/" + transactionId)
    }

    // async function handleCheckout() {
    //     const transactionId = await createTransaction({
    //         items: cartItems,
    //         total: grandTotal,
    //         paidAmount,
    //         paymentMethod,
    //     });
    //     router.push("/transactions/" + transactionId)
    // }
    
return (
    <div className="space-y-6">
        {/* HEADER */}
        <div>
            <h1 className="text-2xl font-bold text-black">
                Kasir / POS
            </h1>

            <p className="text-sm text-slate-500">
                Halaman Transaksi Baru
            </p>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* =======================
                DAFTAR PRODUK
            ======================= */}
            <div className="space-y-4">

                <div>
                    <h2 className="text-lg font-bold text-black">
                        Pilih Produk
                    </h2>

                    <p className="text-sm text-slate-500">
                        Pilih produk untuk dimasukkan ke keranjang.
                    </p>
                </div>

                {/* SEARCH */}
                <Input
                    type="text"
                    placeholder="Cari nama produk atau SKU..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                />

                {/* PRODUCT LIST */}
                {loading ? (
                    <div className="rounded-2xl border p-6 text-center text-slate-500">
                        Memuat produk...
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">
                        Produk tidak ditemukan.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm"
                            >
                                <div>
                                    <h3 className="font-bold text-black">
                                        {product.name}
                                    </h3>

                                    <p className="text-sm text-slate-500">
                                        SKU: {product.sku}
                                    </p>

                                    <p className="mt-1 font-semibold text-indigo-600">
                                        {formatRupiah(product.price)}
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    onClick={() =>
                                        handleAddToCart(product)
                                    }
                                >
                                    Tambah
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            {/* =======================
                KERANJANG
            ======================= */}
            <div className="space-y-4">

                <div>
                    <h2 className="text-lg font-bold text-black">
                        Keranjang
                    </h2>

                    <p className="text-sm text-slate-500">
                        Produk yang dipilih untuk transaksi.
                    </p>
                </div>


                {/* KERANJANG KOSONG */}
                {cartItems.length === 0 ? (

                    <div className="rounded-2xl border border-dashed p-8 text-center">
                        <ShoppingCart
                            className="mx-auto text-slate-400"
                            size={40}
                        />

                        <h3 className="mt-4 font-bold text-black">
                            Keranjang Masih Kosong
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Pilih produk dari daftar di sebelah kiri.
                        </p>
                    </div>

                ) : (

                    <>
                        {/* =======================
                            CART ITEMS
                        ======================= */}
                        <div className="space-y-3">

                            {cartItems.map((item) => (

                                <div
                                    key={item.productId}
                                    className="rounded-2xl border bg-white p-4 shadow-sm"
                                >

                                    <div className="flex items-start justify-between gap-4">

                                        <div>
                                            <h3 className="font-bold text-black">
                                                {item.name}
                                            </h3>

                                            <p className="text-sm text-slate-500">
                                                {formatRupiah(item.price)}
                                                {" × "}
                                                {item.qty}
                                            </p>

                                            <p className="mt-1 font-semibold text-indigo-600">
                                                {formatRupiah(item.subtotal)}
                                            </p>
                                        </div>


                                        {/* HAPUS */}
                                        <button
                                            type="button"
                                            className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                                            onClick={() =>
                                                handleRemoveItem(
                                                    item.productId
                                                )
                                            }
                                        >
                                            <Trash size={16} />
                                        </button>

                                    </div>


                                    {/* QUANTITY */}
                                    <div className="mt-4">
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">
                                            Jumlah
                                        </label>

                                        <Input
                                            type="number"
                                            min={1}
                                            value={item.qty}
                                            onChange={(event) =>
                                                handleUpdateQty(
                                                    item.productId,
                                                    Number(
                                                        event.target.value
                                                    )
                                                )
                                            }
                                        />
                                    </div>

                                </div>

                            ))}

                        </div>


                        {/* =======================
                            RINGKASAN TRANSAKSI
                        ======================= */}
                        <div className="rounded-2xl border bg-white p-5 shadow-sm">

                            <h3 className="mb-4 text-lg font-bold text-black">
                                Ringkasan Transaksi
                            </h3>


                            {/* SUBTOTAL */}
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">
                                    Subtotal
                                </span>

                                <span className="font-semibold text-black">
                                    {formatRupiah(subtotal)}
                                </span>
                            </div>


                            {/* DISCOUNT */}
                            <div className="mt-4">
                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Diskon
                                </label>

                                <Input
                                    type="number"
                                    min={0}
                                    value={discount}
                                    onChange={(event) =>
                                        setDiscount(
                                            Number(event.target.value) || 0
                                        )
                                    }
                                    placeholder="Masukkan diskon"
                                />
                            </div>


                            {/* GRAND TOTAL */}
                            <div className="mt-5 flex items-center justify-between border-t pt-4">

                                <span className="font-bold text-black">
                                    Grand Total
                                </span>

                                <span className="text-xl font-bold text-indigo-600">
                                    {formatRupiah(grandTotal)}
                                </span>

                            </div>


                            {/* PAYMENT METHOD */}
                            <div className="mt-5">

                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Metode Bayar
                                </label>

                                <select
                                    value={paymentMethod}
                                    onChange={(event) =>
                                        setPaymentMethod(
                                            event.target.value as PaymentMethod
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-black outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                >
                                    <option value="cash">
                                        CASH
                                    </option>

                                    <option value="transfer">
                                        TRANSFER
                                    </option>

                                    <option value="qris">
                                        QRIS
                                    </option>
                                </select>

                            </div>


                            {/* CHECKOUT */}
                            <Button
                                type="button"
                                disabled={cartItems.length === 0}
                                onClick={handleCheckout}
                                className="mt-5 w-full"
                            >
                                Checkout
                            </Button>

                        </div>

                    </>
                )}

            </div>

        </div>

    </div>
);
    
        
}