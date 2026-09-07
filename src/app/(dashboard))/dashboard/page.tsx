import {
    Boxes,
    CircleDollarSign,
    ReceiptText,
    TriangleAlert,
} from "lucide-react";

export default function DashboardPage(){
    const cards = [
        {
            label: "Total Produk",
            value: "0",
            icon: Boxes,
        },
        {
            label: "Transaksi Hari Ini",
            value: "0",
            icon: ReceiptText,
        },
        {
            label: "Omzet Hari Ini",
            value: "0",
            icon: CircleDollarSign,
        },
        {
            label: "Stok Menipis",
            value: "0",
            icon: TriangleAlert,
        },
    ];
    return (
        <div>
            <div className="mb-7">
                <p className="text-sm font-bold text-indigo-600">
                    OVERVIEW
                </p>

                <h1 className=" text-sm font-bold tracking-tight mt-2">
                    Dashboard
                </h1>

                <p className="text-sm text-slate-500">
                    Rinkasan aktifitas MiniPos hari ini
                </p>
            </div>

            <div>
                {cards.map((card) => {
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
                })}
            </div>
        </div>
    );
}