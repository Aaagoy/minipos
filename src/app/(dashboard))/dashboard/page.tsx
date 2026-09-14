"use client";

import { getProducts } from "@/services/product.service";
import { getTransactions } from "@/services/transaction.service";
import { formatCurrency } from "@/utils/currency";
import {
    Boxes,
    CircleDollarSign,
    ReceiptText,
    TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Product } from "@/types/product";
import { SaleTransaction, TransactionItem } from "@/types/transaction";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function isToday(date?: SaleTransaction["createdAt"]){
    if(!date) return false;
    const value = date.toDate();
    const today = new Date();
    return value.getFullYear() === today.getFullYear() && value.getMonth() === today.getMonth() && value.getDate() === today.getDate();
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [transactions, setTransactions] = useState<SaleTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!user) return;
        try{
            setLoading(true);
            const [productData, transactionData] = await Promise.all([getProducts(user.uid), getTransactions(user.uid)]);
            setProducts(productData);
            setTransactions(transactionData);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {void load();}, [load]);

    const todayTransactions = useMemo(() => transactions.filter((trx) => isToday(trx.createdAt)), [transactions]);
    const todayRevenue = useMemo(() => todayTransactions.reduce((sum, trx) => sum + trx.total, 0), [todayTransactions]);
    const lowStock = useMemo(() => products.filter((product) => product.stock <= 5).length, [products]);

    const cards = [
        { label: "Total Produk", value: String(products.length), icon: Boxes},
        { label: "Transaksi Hari Ini", value: String(todayTransactions.length), icon: ReceiptText},
        { label: "Omzet Hari Ini", value: formatCurrency(todayRevenue), icon: CircleDollarSign},
        { label: "Stok Menipis", value: String(lowStock), icon: TriangleAlert},
    ];    

    return (
        <div>
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-bold text-indigo-600">
                        OVERVIEW
                    </p>
                    <h1 className="mt-2 text-sm font-bold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-sm text-slate-500">
                        Rinkasan aktifitas MiniPos hari ini
                    </p>
                </div>
                <Link href="/transactions/new"><Button>Mulai Transaksi</Button></Link>
            </div>

            {loading ? (
                <div className="rounded-2xl bg-white p-8 text-sm text-slate-500">Memuat Dashboard...</div>
            ) : (
                <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return(
                            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                L73
                            </div>
                        )
                    })}
                </div>
                </>
            )}
            

            <div className="m-5 rounded-2xl border bg-white p-5 text-black shadow-sm">
                <h2 className="text-lg font-black">Produk Terlaris</h2>

                <div className="mt-4 space-y-3">
                    {/* {bestSellingProducts.map(([name, quantity]) => (
                        <div
                            key={name}
                            className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                        >
                            <span className="font-semibold">{name}</span>

                            <span className="text-sm text-slate-950">
                                {quantity} terjual
                            </span>
                        </div>
                    ))} */}

                    {bestSellingProducts.length === 0 ? (
                        <p className="mt-4 text-sm text-slate-500">
                            Belum ada penjualan hari ini.
                        </p>
                    ) : (
                        <div className="mt-4 space-y-4">
                            {bestSellingProducts.map(
                                ([name, quantity], index) => {
                                    // Skema warna variatif untuk grafik batang
                                    const colors = [
                                        "bg-indigo-500",
                                        "bg-emerald-500",
                                        "bg-amber-500",
                                        "bg-sky-500",
                                        "bg-rose-500",
                                    ];

                                    const barColor =
                                        colors[index % colors.length];

                                    // Hitung persentase relatif terhadap produk terlaris urutan pertama
                                    const maxQuantity =
                                        bestSellingProducts[0][1] || 1;

                                    const percentage = Math.round(
                                        (quantity / maxQuantity) * 100
                                    );

                                    return (
                                        <div
                                            key={name}
                                            className="space-y-1"
                                        >
                                            <div className="flex justify-between text-sm font-semibold text-slate-800">
                                                <span>{name}</span>

                                                <span className="font-bold text-slate-500">
                                                    {quantity}
                                                </span>
                                            </div>

                                            {/* Visual Progress Bar */}
                                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="m-5 rounded-2xl border bg-white p-5 text-black shadow-sm">
                <h2 className="text-lg font-black">Stok Menipis</h2>

                <div className="mt-4 space-y-4">
                    {lowStockProducts.map((product) => {
                        const stockPercentage = Math.min(
                            (product.stock / LOW_STOCK_LIMIT) * 100,
                            100
                        );

                        return (
                            <div
                                key={product.id}
                                className="rounded-xl p-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">
                                        {product.name}
                                    </span>

                                    <span className="text-sm font-bold text-amber-700">
                                        Stok {product.stock}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-3 h-2 w-full overflow-hidden rounded-full">
                                    <div
                                        className="h-full rounded-full bg-rose-600 transition-all"
                                        style={{
                                            width: `${stockPercentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* <div className="rounded-2xl border bg-white p-5 shadow-sm m-5 text-black">
                <h2 className="text-lg font-black">Stok Menipis</h2>
                <div className="mt-4 space-y-3">                    
                    {lowStockProducts.map((product) => (
                        <div
                            key={product.id}
                            className="flex items-center justify-between rounded-xl bg-amber-50 p-3"
                        >
                            <span className="font-semibold">
                                {product.name}
                            </span>

                            <span className="text-sm font-bold text-amber-700">
                                Stok {product.stock}
                            </span>
                        </div>
                    ))}
                </div>
            </div> */}

            {/* Stat Card */}
            {/* Produk Terlaris */}
            {/* Stok Menipis */}
        </div>
    );
}