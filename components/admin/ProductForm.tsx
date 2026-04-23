'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Product, ProductSize } from '@/types';

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

interface ProductFormProps {
  initial?: Partial<Product>;
  productId?: string;
}

export default function ProductForm({ initial, productId }: ProductFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!productId;

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    price: initial?.price?.toString() ?? '',
    category: (initial?.category ?? 'tshirt') as 'tshirt' | 'vinyl',
    image_url: initial?.image_url ?? '',
    badge: initial?.badge ?? '',
    active: initial?.active ?? true,
    stock: initial?.stock?.toString() ?? '0',
  });

  const [sizes, setSizes] = useState<ProductSize[]>(
    initial?.product_sizes?.length
      ? initial.product_sizes
      : DEFAULT_SIZES.map(s => ({ size: s, stock: 0 }))
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();

    if (res.ok) {
      setForm(f => ({ ...f, image_url: data.url }));
    } else {
      setError(data.error ?? 'Upload failed');
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      sizes: form.category === 'tshirt' ? sizes : undefined,
    };

    const url = isEdit ? `/api/admin/products/${productId}` : '/api/admin/products';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push('/admin/products');
    } else {
      const d = await res.json();
      setError(d.error ?? 'Save failed');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl flex flex-col gap-6">
      {/* Image upload */}
      <div>
        <label className="block font-heading text-[10px] tracking-[0.3em] text-white/40 uppercase mb-2">
          Product Image
        </label>
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
            {form.image_url ? (
              <img src={form.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-heading text-[10px] text-white/20">NO IMG</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="bg-white/10 text-white font-heading text-xs tracking-[0.2em] uppercase px-4 py-2 hover:bg-white/20 transition-colors disabled:opacity-40"
            >
              {uploading ? 'UPLOADING...' : 'UPLOAD IMAGE'}
            </button>
            <input
              type="text"
              value={form.image_url}
              onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              placeholder="Or paste image URL"
              className="bg-white/5 border border-white/10 text-white placeholder-white/20 px-3 py-2 font-body text-xs focus:outline-none focus:border-gold"
            />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
        </div>
      </div>

      {/* Name */}
      <Field label="Product Name" required>
        <input
          type="text" required
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className={inputCls}
          placeholder="SANELi Crown Tee — Black"
        />
      </Field>

      {/* Description */}
      <Field label="Description">
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className={`${inputCls} h-20 resize-none`}
          placeholder="Short product description"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        {/* Price */}
        <Field label="Price (USD)" required>
          <input
            type="number" min="0" step="0.01" required
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            className={inputCls}
            placeholder="45.00"
          />
        </Field>

        {/* Category */}
        <Field label="Category" required>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value as 'tshirt' | 'vinyl' }))}
            className={`${inputCls} cursor-pointer`}
          >
            <option value="tshirt">T-Shirt</option>
            <option value="vinyl">Vinyl</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Badge */}
        <Field label="Badge (optional)">
          <input
            type="text"
            value={form.badge}
            onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
            className={inputCls}
            placeholder="NEW, LIMITED..."
          />
        </Field>

        {/* Active */}
        <Field label="Visibility">
          <select
            value={form.active ? 'true' : 'false'}
            onChange={e => setForm(f => ({ ...f, active: e.target.value === 'true' }))}
            className={`${inputCls} cursor-pointer`}
          >
            <option value="true">Live (visible)</option>
            <option value="false">Hidden</option>
          </select>
        </Field>
      </div>

      {/* Sizes (tshirt) */}
      {form.category === 'tshirt' ? (
        <div>
          <label className="block font-heading text-[10px] tracking-[0.3em] text-white/40 uppercase mb-3">
            Sizes &amp; Stock
          </label>
          <div className="grid grid-cols-5 gap-2">
            {sizes.map((s, i) => (
              <div key={s.size} className="flex flex-col gap-1">
                <span className="font-heading text-xs text-white/60 text-center">{s.size}</span>
                <input
                  type="number" min="0"
                  value={s.stock}
                  onChange={e => {
                    const updated = [...sizes];
                    updated[i] = { ...s, stock: parseInt(e.target.value, 10) || 0 };
                    setSizes(updated);
                  }}
                  className={`${inputCls} text-center`}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Field label="Stock Quantity">
          <input
            type="number" min="0"
            value={form.stock}
            onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
            className={inputCls}
          />
        </Field>
      )}

      {error && <p className="font-body text-xs text-red-400">{error}</p>}

      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-gold text-charcoal font-heading text-xs tracking-[0.3em] uppercase px-8 py-3 hover:bg-gold-light transition-colors disabled:opacity-40"
        >
          {saving ? 'SAVING...' : isEdit ? 'SAVE CHANGES' : 'CREATE PRODUCT'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="font-heading text-xs tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-heading text-[10px] tracking-[0.3em] text-white/40 uppercase mb-2">
        {label}{required && <span className="text-gold ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-3 py-2.5 font-body text-sm focus:outline-none focus:border-gold';
