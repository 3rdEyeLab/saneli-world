'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import type { Product } from '@/types';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/products')
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); });
  };

  useEffect(load, []);

  const toggleActive = async (product: Product) => {
    await fetch(`/api/admin/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...product, active: !product.active }),
    });
    load();
  };

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl tracking-widest uppercase">Products</h1>
          <Link
            href="/admin/products/new"
            className="bg-gold text-charcoal font-heading text-xs tracking-[0.25em] uppercase px-5 py-2.5 hover:bg-gold-light transition-colors"
          >
            + ADD PRODUCT
          </Link>
        </div>

        {loading ? (
          <p className="font-body text-white/30 text-sm">Loading...</p>
        ) : products.length === 0 ? (
          <p className="font-body text-white/30 text-sm">No products yet.</p>
        ) : (
          <div className="bg-white/5 border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-heading text-[10px] tracking-[0.25em] text-white/40 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(product => {
                  const totalStock = product.category === 'tshirt'
                    ? (product.product_sizes?.reduce((s, ps) => s + ps.stock, 0) ?? 0)
                    : (product.stock ?? 0);

                  return (
                    <tr key={product.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 bg-white/5 overflow-hidden">
                          {product.image_url && (
                            <img src={product.image_url} alt={product.name}
                              className="w-full h-full object-cover" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-body text-sm text-white">{product.name}</p>
                        {product.badge && (
                          <span className="font-heading text-[9px] tracking-wider text-gold uppercase">{product.badge}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-heading text-xs tracking-wider text-white/50 uppercase">
                        {product.category}
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-white">${Number(product.price).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-heading text-xs ${totalStock === 0 ? 'text-red-400' : totalStock < 5 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {totalStock === 0 ? 'OUT' : totalStock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(product)}
                          className={`font-heading text-[10px] tracking-wider px-2 py-1 ${
                            product.active ? 'text-green-400 bg-green-400/10' : 'text-white/30 bg-white/5'
                          }`}
                        >
                          {product.active ? 'LIVE' : 'HIDDEN'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="font-heading text-xs tracking-wider text-gold hover:text-gold-light"
                          >
                            EDIT
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
