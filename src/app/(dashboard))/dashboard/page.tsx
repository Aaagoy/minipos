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
import { useEffect, useMemo, useState } from "react";
import { Product } from "@/types/product";
import { Transaction } from "@/types/transaction";

const LOW_STOCK_LIMIT = 5;

export default function DashboardPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadDashboardData() {
        try {
            setLoading(true);
            setError("");

            const [productData, transactionData] = await Promise.all([
                getProducts(),
                getTransactions(),
            ]);

            setProducts(productData as Product[]);
            setTransactions(transactionData as Transaction[]);
        } catch {
            setError("Gagal memuat data Dashboard.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // void
        async function loadData() {
            await loadDashboardData();
        }

        void loadData();
    }, []);

    function istoday(date: Date) {
        const today = new Date();

        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    }

    const todayTransaction = useMemo(() => {
        return transactions.filter((transactions) => {
            const createdAt = new Date(transactions.createdAt);

            return istoday(createdAt);
        });
    }, [transactions]);

    const todayRevenue = useMemo(() => {
        return todayTransaction.reduce((total, transaction) => {
            return total + transaction.total;
        }, 0);
    }, [todayTransaction]);

    const lowStockProducts = useMemo(() => {
        return products.filter((product) => {
            return product.stock <= LOW_STOCK_LIMIT;
        });
    }, [products]);

    const totalLowStock = lowStockProducts.length;

    const bestSellingProducts = useMemo(() => {
        const summary: Record<string, number> = {};

        transactions.forEach((transaction) => {
            transaction.items.forEach((item) => {
                summary[item.productName] =
                    (summary[item.productName] || 0) + item.quantity;
            });
        });

        return Object.entries(summary)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [transactions]);

    const stats = [
        {
            label: "Total Produk",
            value: products.length.toString(),
            icon: Boxes,
        },
        {
            label: "Transaksi Hari Ini",
            value: todayTransaction.length.toString(),
            icon: ReceiptText,
        },
        {
            label: "Omzet Hari Ini",
            value: formatCurrency(todayRevenue),
            icon: CircleDollarSign,
        },
        {
            label: "Stok Menipis",
            value: totalLowStock.toString(),
            icon: TriangleAlert,
        },
    ];

    if (loading) {
        return (
            <div className="rounded-2xl border bg-white p-8 text-center">
                Memuat dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
                {error}
            </div>
        );
    }

    return (
        <div>
            <div className="mb-7">
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

            <div className="m-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.label}
                            className="rounded-2xl border bg-white p-5 text-2xl text-black shadow-sm"
                        >
                            <Icon
                                className="text-indigo-600"
                                size={22}
                            />

                            <p className="mt-5 text-sm text-slate-500">
                                {stat.label}
                            </p>

                            <h3 className="mt-1 text-2xl font-black">
                                {stat.value}
                            </h3>
                        </div>
                    );
                })}

                {/* {cards.map((card) => {
                    const Icon = card.icon
                    
                    return (
                        <div 
                        key={card.label}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-2">
                            <div className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                                <Icon size={19}/>
                            </div>
                            <div className="mt-5 text-sm font-semibold text-slate-500">
                                {card.label}
                            </div>

                            <div className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                                {card.value}
                            </div>
                        </div>
                    );
                })} */}
            </div>

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