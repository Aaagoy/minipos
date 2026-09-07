"use client";
import React from 'react'
import { useState } from "react";
import Link from "next/link";
import { Input } from "../ui/input";
import { Product, ProductInput } from "@/types/product";
import { Button } from '../ui/button';
// import { error } from 'console';

// type ProductFormProps = {
//   initialValues?: ProductInput;
//   submitLabel?: string;
//   onSubmit: (values: ProductInput) => void;
// };

type ProductFormProps = {
  defaultValues?: ProductInput | Product;
  submitLabel?: string;
  onSubmit: (input: ProductInput) => void;
};

type FormErrors = Partial<Record<keyof ProductInput, string>>;

const initialDefaultValues: ProductInput = {
  name: "",
  sku: "",
  price: 0,
  stock: 0,
};

export function ProductForm({
  defaultValues = initialDefaultValues,
  submitLabel = "Simpan Produk",
  onSubmit,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductInput>({
    name: defaultValues?.name ?? "",
    sku: defaultValues?.sku ?? "",
    price: defaultValues?.price ?? 0,
    stock: defaultValues?.stock ?? 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  function updateField(field: keyof ProductInput, value: string) {
    setValues((current) => ({
      ...current,
      [field]: field === "price" || field === "stock" ? Number(value) : value,
    }));
  }

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateProduct(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-bold text-slate-700">Nama Produk</label>
        <Input
          value={values.name}
          onChange={(event) => updateField("name", event.target.value)}
          placeholder="Contoh : Kopi Susu"
        />
        {errors.name && (
          <p className="mt-1 text-sm font-semibold text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-bold text-slate-700">SKU</label>
        <Input
          value={values.sku}
          onChange={(event) => updateField("sku", event.target.value)}
          placeholder="Contoh : KPS-001"
        />
        {errors.sku && (
          <p className="mt-1 text-sm font-semibold text-red-600">
            {errors.sku}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-bold text-slate-700">Price</label>
        <Input
          type="number"
          value={values.price}
          onChange={(event) => updateField("price", event.target.value)}
          placeholder="Contoh: 15000"
        />
        {errors.price && (
          <p className="mt-1 text-sm font-semibold text-red-600">
            {errors.price}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-bold text-slate-700">Stock</label>
        <Input
          type="number"
          value={values.stock}
          onChange={(event) => updateField("stock", event.target.value)}
          placeholder="Contoh: 10"
        />
        {errors.stock && (
          <p className="mt-1 text-sm font-semibold text-red-600">
            {errors.stock}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" 
        // asChild
        >
          <Link href="/products">Batal</Link>
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

function validateProduct(values: ProductInput) {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Nama produk wajib diisi.";
  }

  if (!values.sku.trim()) {
    errors.sku = "SKU wajib diisi.";
  }
  if (values.price <= 0) {
    errors.price = "Harga harus lebih dari nol.";
  }
  if (values.stock < 0) {
    errors.stock = "Stock tidak boleh minus.";
  }

  return errors;
}