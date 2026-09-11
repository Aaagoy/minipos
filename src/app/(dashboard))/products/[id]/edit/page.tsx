"use client";
import { Product, ProductInput, } from "@/types/product";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductForm } from "@/components/products/product-form";
// import { updateProduct } from "@/services/product.service";
import { getProductById } from "@/lib/product-storage";
import { useAuth } from "@/context/auth-context";
import { updateProduct } from "@/services/product.service";

export default function EditProductPage(){
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const {user} = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(()=> {
        async function loadProduct(){
            const data = await getProductById(params.id);
            setProduct(data ?? null);
            setLoading(false);
        }
        loadProduct();
    }, [params.id]);
    
    if (loading) {
        return <p>Memuat Produk...</p>
    }
    if (!product){
        return <p>Produk Tidak Ditemukan</p>
    }
    
    async function handleSubmit(input: ProductInput){
        if(!product)
            return;
        if(!user)
            return;
        await updateProduct(user.uid, product.id, input);
        router.push("/products");
    }

    return (
        <div>
            <p className="text-2xl font-bold mb-4 text-indigo-600">
                Master Data
            </p>
            <h1 className="mt-1 text-3xl font-black">
                Edit Produk
            </h1>
            <ProductForm
            // defaultValues={product}
            initialData={product}
            submitLabel="Simpan Perubahan"
            onSubmit={handleSubmit}
            />
        </div>
    )
}

