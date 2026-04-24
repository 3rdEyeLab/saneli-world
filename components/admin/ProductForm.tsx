'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Product, ProductSize, ProductColor, ProductImage } from '@/types';

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

interface ProductFormProps {
  initial?: Partial<Product>;
  productId?: string;
}

export default function ProductForm({ initial, productId }: ProductFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const extraFileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!productId;

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    price: initial?.price?.toString() ?? '',
    image_url: initial?.image_url ?? '',
    badge: initial?.badge ?? '',
    active: initial?.active ?? true,
    stock: initial?.stock?.toString() ?? '0',
  });

  const [categories, setCategories] = useState<string[]>(
    initial?.category
      ? (Array.isArray(initial.category) ? initial.category : [initial.category])
      : ['tshirt']
  );

  const toggleCategory = (cat: string) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const CATEGORY_OPTIONS = [
    { value: 'tshirt',   label: 'T-Shirt' },
    { value: 'vinyl',    label: 'Vinyl' },
    { value: 'cassette', label: 'Cassette' },
    { value: 'music',    label: 'Music' },
  ];

  const [sizes, setSizes] = useState<ProductSize[]>(
    initial?.product_sizes?.length
      ? initial.product_sizes
      : DEFAULT_SIZES.map(s => ({ size: s, stock: 0 }))
  );

  const [colors, setColors] = useState<ProductColor[]>(
    initial?.product_colors ?? []
  );

  const [images, setImages] = useState<ProductImage[]>(
    initial?.product_images?.length
      ? [...initial.product_images].sort((a, b) => a.sort_order - b.sort_order)
      : []
  );

  const [uploading, setUploading] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    return res.ok ? data.url : null;
  };

  const handlePrimaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) setForm(f => ({ ...f, image_url: url }));
    else setError('Upload failed');
    setUploading(false);
  };

  const handleExtraUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingExtra(true);
    for (const file of files) {
      const url = await uploadFile(file);
      if (url) {
        setImages(prev => [...prev, { url, sort_order: prev.length }]);
      }
    }
    setUploadingExtra(false);
    if (extraFileRef.current) extraFileRef.current.value = '';
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx).map((img, i) => ({ ...img, sort_order: i })));
  };

  const addColor = () => {
    setColors(prev => [...prev, { color_name: '', color_hex: '#000000', stock: 0 }]);
  };

  const updateColor = (idx: number, field: keyof ProductColor, value: string | number) => {
    setColors(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const removeColor = (idx: number) => {
    setColors(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      category: categories,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      sizes: categories.includes('tshirt') ? sizes : undefined,
      colors: colors.filter(c => c.color_name.trim()),
      images,
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

      {/* Primary image */}
      <div>
        <label className="block font-heading text-[10px] tracking-[0.3em] text-white/40 uppercase mb-2">
          Primary Image
        </label>
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
            {form.image_url ? (
              <img src={form.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-heading text-[10px] text-white/20">NO IMG</span>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="bg-white/10 text-white font-heading text-xs tracking-[0.2em] uppercase px-4 py-2 hover:bg-white/20 transition-colors disabled:opacity-40">
              {uploading ? 'UPLOADING...' : 'UPLOAD IMAGE'}
            </button>
            <input type="text" value={form.image_url}
              onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              placeholder="Or paste image URL"
              className="bg-white/5 border border-white/10 text-white placeholder-white/20 px-3 py-2 font-body text-xs focus:outline-none focus:border-gold" />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePrimaryUpload} />
          </div>
        </div>
      </div>

      {/* Additional images */}
      <div>
        <label className="block font-heading text-[10px] tracking-[0.3em] text-white/40 uppercase mb-2">
          Additional Images
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((img, i) => (
            <div key={i} className="relative w-20 h-20 bg-white/5 border border-white/10 overflow-hidden group">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeImage(i)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-heading text-xs">
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={() => extraFileRef.current?.click()} disabled={uploadingExtra}
            className="w-20 h-20 border border-dashed border-white/20 flex items-center justify-center text-white/30 hover:text-white/60 hover:border-white/40 transition-colors font-heading text-xs">
            {uploadingExtra ? '...' : '+ ADD'}
          </button>
        </div>
        <input ref={extraFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleExtraUpload} />
      </div>

      {/* Name */}
      <Field label="Product Name" required>
        <input type="text" required value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className={inputCls} placeholder="SANELi Crown Tee — Black" />
      </Field>

      {/* Description */}
      <Field label="Description">
        <textarea value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className={`${inputCls} h-20 resize-none`} placeholder="Short product description" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Price (USD)" required>
          <input type="number" min="0" step="0.01" required value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            className={inputCls} placeholder="45.00" />
        </Field>
        <Field label="Categories" required>
          <div className="flex flex-wrap gap-3 pt-1">
            {CATEGORY_OPTIONS.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={categories.includes(value)}
                  onChange={() => toggleCategory(value)}
                  className="accent-gold w-4 h-4"
                />
                <span className="font-heading text-xs tracking-wider text-white/70 uppercase">{label}</span>
              </label>
            ))}
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Badge (optional)">
          <input type="text" value={form.badge}
            onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
            className={inputCls} placeholder="NEW, LIMITED..." />
        </Field>
        <Field label="Visibility">
          <select value={form.active ? 'true' : 'false'}
            onChange={e => setForm(f => ({ ...f, active: e.target.value === 'true' }))}
            className={`${inputCls} cursor-pointer`}>
            <option value="true">Live (visible)</option>
            <option value="false">Hidden</option>
          </select>
        </Field>
      </div>

      {/* Sizes */}
      {categories.includes('tshirt') ? (
        <div>
          <label className="block font-heading text-[10px] tracking-[0.3em] text-white/40 uppercase mb-3">
            Sizes &amp; Stock
          </label>
          <div className="grid grid-cols-5 gap-2">
            {sizes.map((s, i) => (
              <div key={s.size} className="flex flex-col gap-1">
                <span className="font-heading text-xs text-white/60 text-center">{s.size}</span>
                <input type="number" min="0" value={s.stock}
                  onChange={e => {
                    const updated = [...sizes];
                    updated[i] = { ...s, stock: parseInt(e.target.value, 10) || 0 };
                    setSizes(updated);
                  }}
                  className={`${inputCls} text-center`} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Field label="Stock Quantity">
          <input type="number" min="0" value={form.stock}
            onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
            className={inputCls} />
        </Field>
      )}

      {/* Colors */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-heading text-[10px] tracking-[0.3em] text-white/40 uppercase">
            Color Variants (optional)
          </label>
          <button type="button" onClick={addColor}
            className="font-heading text-[10px] tracking-[0.2em] uppercase text-gold hover:text-white transition-colors">
            + ADD COLOR
          </button>
        </div>
        {colors.length > 0 && (
          <div className="flex flex-col gap-2">
            {colors.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <input type="color" value={c.color_hex}
                  onChange={e => updateColor(i, 'color_hex', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0" />
                <input type="text" value={c.color_name} placeholder="Color name (e.g. Black)"
                  onChange={e => updateColor(i, 'color_name', e.target.value)}
                  className={`${inputCls} flex-1`} />
                <input type="number" min="0" value={c.stock} placeholder="Stock"
                  onChange={e => updateColor(i, 'stock', parseInt(e.target.value, 10) || 0)}
                  className={`${inputCls} w-20`} />
                <button type="button" onClick={() => removeColor(i)}
                  className="text-white/30 hover:text-red-400 transition-colors font-body text-sm">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="font-body text-xs text-red-400">{error}</p>}

      <div className="flex gap-4 pt-2">
        <button type="submit" disabled={saving}
          className="bg-gold text-charcoal font-heading text-xs tracking-[0.3em] uppercase px-8 py-3 hover:opacity-90 transition-opacity disabled:opacity-40">
          {saving ? 'SAVING...' : isEdit ? 'SAVE CHANGES' : 'CREATE PRODUCT'}
        </button>
        <button type="button" onClick={() => router.push('/admin/products')}
          className="font-heading text-xs tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors">
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
