'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import ProductForm from '@/components/admin/ProductForm';
import type { Product } from '@/types';

export default function EditProduct({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`)
      .then(r => r.json())
      .then(setProduct);
  }, [params.id]);

  return (
    <AdminShell>
      <div className="p-8">
        <h1 className="font-heading text-3xl tracking-widest uppercase mb-8">Edit Product</h1>
        {product ? (
          <ProductForm initial={product} productId={params.id} />
        ) : (
          <p className="font-body text-white/30 text-sm">Loading...</p>
        )}
      </div>
    </AdminShell>
  );
}
