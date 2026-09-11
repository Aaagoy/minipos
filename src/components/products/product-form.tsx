"use client";
import React, { FormEvent, useEffect } from 'react'
import { useState } from "react";
import { Input } from "../ui/input";
import { ProductInput } from "@/types/product";
import { Button } from '../ui/button';
import { LoaderCircle } from 'lucide-react';

const initialValue: ProductInput = {
  name: "",
  sku: "",
  price: 0,
  stock: 0,
};
type Props = {
  initialData?: ProductInput;
  submitLabel?: string;
  onSubmit: (data: ProductInput) => Promise<void>;
};

export function ProductForm({initialData, submitLabel = "Simpan Produk", onSubmit }: Props) {
  const [form, setForm] = useState<ProductInput>(initialData ?? initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  function setField<K extends keyof ProductInput>(field: K, value: ProductInput[K]){
    setForm((current) => ({...current, [field]: value}));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>){
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.sku.trim()) return setError("Nama dan SKU wajib diisi.");
    if (form.price <= 0 ) return setError("Harga harus lebih dari 0.");
    if (form.stock <= 0 ) return setError("Stok harus lebih dari 0.");

    try {
      setLoading(true);
      await onSubmit({...form, name: form.name.trim(), sku: form.sku.trim().toUpperCase() });
    } catch(err){
      setError(err instanceof Error ? err.message : "Gagal menyimpan produk.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 grid gap-5 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <Input
        value={form.name} onChange={(e)=> setField("name", e.target.value)}
        placeholder="Contoh: Stem Oxo"
        label="Nama Produk" className="grid gap-5 rounded-xl bg-white p-5 shadow-sm sm:p-6"
        />
        <Input        
        label="SKU" placeholder="Contoh: SOXO001" value={form.sku} onChange={(e) => setField("sku", e.target.value)}
        />        
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Harga" type="number" min="1" value={form.price || ""} onChange={(e) => setField("price", Number(e.target.value))} /> <br />
          <Input label="Stok" type="number" min="1" value={form.stock || ""} onChange={(e) => setField("stock", Number(e.target.value))} />
        </div>

          {error && <div className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
          <Button type="submit" disabled={loading} className="sm:w-fit">
            {loading && <LoaderCircle size={18} className="animate-spin"/>}
            {loading ? "Menyimpan..." : submitLabel}
          </Button>
      </form>
  );     
}