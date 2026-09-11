import { PrintButton } from "@/components/transactions/print-button";
import { getTransactionById, getTransactions } from "@/services/transaction.service";
import { formatCurrency } from "@/utils/format";
import { notFound } from "next/navigation";
import type { Transaction } from "@/types/transaction";
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
                
            </tbody>
        </table>

        <PrintButton />
    </div>
    )
}