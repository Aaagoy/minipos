import { Product, ProductInput } from "@/types/product";


const STORAGE_KEY = "minipos-products"
const sampleProducts: Product[] = [
    {
        id: "1",
        name: "Kopi Susu",
        sku: "KOPI001",
        price: 18000,
        stock: 12,
    },
    {
        id: "2",
        name: "Ice Tea",
        sku: "ICETEA001",
        price: 12000,
        stock: 8,
    },
]

export function getProducts() {
    if (typeof window === "undefined") {
        return sampleProducts;
}

const saved = window.localStorage.getItem(STORAGE_KEY);

if (!saved) {
    window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(sampleProducts)
    );
    return sampleProducts;
}
    return JSON.parse(saved) as Product[];
}

export function addProduct(input: ProductInput) {
    const products = getProducts();
    const newProduct: Product = {
        id: crypto.randomUUID(),
        ...input,
    };
    const nextProducts = [newProduct, ...products];
    window.localStorage.setItem(
        STORAGE_KEY, 
        JSON.stringify(nextProducts)
    );
    return newProduct;
}