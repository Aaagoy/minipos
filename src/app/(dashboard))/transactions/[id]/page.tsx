import { PrintButton } from "@/components/transactions/print-button";
import { getTransactionById, getTransactions } from "@/services/transaction.service";
import { formatCurrency } from "@/utils/format";
import { notFound } from "next/navigation";
import type { Transaction } from "@/types/transaction";
import { useEffect, useState } from "react";
type PageProps = {
    params: { id: string };
};
export default async function TransactionDetailPage({
    params,
}: PageProps){
    const { id } = await params;
    const transaction = await getTransactionById(id);
    if(!transaction){
        notFound();
    };
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function loadData(){
            const data = await getTransactions();
            setTransactions(data as Transaction[]);
            setLoading(false)
        }
        loadData();
    },[]);

    return (
    <div>
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Harga</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                </tr>
            </thead>

            <tbody>
                {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                        <td>{transaction.items.map((item)=>(
                            <div>
                                {item.productName}
                            </div>
                        ))}</td>
                        <td>{formatCurrency(transaction.total)}</td>
                        <td>{transaction.paidAmount}</td>
                        {/* <td>{formatCurrency(transaction.createdAt)}</td> */}
                    </tr>
                ))};
            </tbody>
        </table>

        <PrintButton />
    </div>
    )
}