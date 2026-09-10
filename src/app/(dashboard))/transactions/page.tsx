"use client";

import { getTransactions } from "@/services/transaction.service";
import { useEffect, useState } from "react";
import type { Transaction, TransactionItem } from "@/types/transaction";
import { formatCurrency, formatDate } from "@/utils/format";
import Link from "next/link";

export default function TransactionsPage(){  
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getTransactions();
      setTransactions(data as Transaction[]);
      setLoading(false);
    }
    loadData();
  }, []);
    return <div className="w-full overflow-x-auto">
    <table className="w-full overflow-hidden border border-slate-50 bg-white text-sm text-black">
        <thead>
            <tr className="border-2">
                <th className="px-4 py-3 text-center">Invoice</th>
                <th className="px-4 py-3 text-center">Produk</th>
                <th className="px-4 py-3 text-center">Tanggal</th>
                <th className="px-4 py-3 text-center">Total</th>
                <th className="px-4 py-3 text-center">Pembayaran</th>
                <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
        </thead>

        <tbody>
            {transactions.map((transaction) => (
                <tr 
                    key={transaction.id}
                    className="border-2"
                >
                    <td className="px-4 py-3 text-center">
                        {transaction.invoiceNumber}
                    </td>

                    <td className="px-4 py-3 text-center">
                        {transaction.items.map((item) => (
                            <div key={item.productId}>
                                {item.productName}
                            </div>
                        ))}
                    </td>

                    <td className="px-4 py-3 text-center">
                        {formatDate(transaction.createdAt)}
                    </td>

                    <td className="px-4 py-3 text-center">
                        {formatCurrency(transaction.total)}
                    </td>

                    <td className="px-4 py-3 text-center capitalize">
                        {transaction.paymentMethod}
                    </td>

                    <td className="px-4 py-3 text-center">
                        <Link
                            href={"/transactions/" + transaction.id}
                            className="underline font-bold text-blue-700"
                        >
                            Cek Invoice
                        </Link>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>
}