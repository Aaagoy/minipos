"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/products/product-form";
import type { ProductInput } from "@/types/product";
import { addProduct } from "@/services/product.service";


export default function CreateProductPage(){
    const router = useRouter();        
    async function handleCreateProduct(input: ProductInput){
        await addProduct(input);
        router.push("/products");
    }
    // return <ProductForm
    // onSubmit={handlesubmit}/>

    return(
        <div className="max-w-2xl">
            <p className="text-sm font-bold text-indigo-600">
                Master Data
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">
                Tambah Produk
            </h1>
            <p className="mt-2 text-sm text-slate-500">
                Isi data produk yang akan dijual
            </p>
    
            <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
                <ProductForm 
                onSubmit={handleCreateProduct}
                submitLabel="Simpan"/>
            </div>
        </div>
    )

}


