import { PrintButton } from "@/components/transactions/print-button";
import { getTransactionById } from "@/services/transaction.service";
import { notFound } from "next/navigation";

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
    }
    return <div>
        <PrintButton/>
    </div>
}