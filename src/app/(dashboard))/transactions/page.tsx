"use client";

import { getTransactions } from "@/services/transaction.service";
import { useEffect, useState } from "react";
import type { Transaction } from "@/types/transaction";

export default function TransactionsPage(){
    // const [transactions, setTransactions] = useState([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        async function loadData() {
            const data = await getTransactions();
            setTransactions(data);
            setLoading(false);
        }
        loadData();
    }, []);
    return <div>

    </div>
    
}