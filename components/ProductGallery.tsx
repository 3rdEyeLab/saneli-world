'use client';

import { useState, useEffect } from 'react';
import { products as staticProducts } from '@/data/products';
import { supabase } from '@/lib/supabase';
import ProductCard from './ProductCard';
import type { Product } from '@/types';

type Filter = 'all' | 'tshirt' | 'vinyl' | 'cassette' | 'music' | 'subscription';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',          label: 'ALL' },
  { key: 'tshirt',       label: 'TEES' },
  { key: 'vinyl',        label: 'VINYL' },
  { key: 'cassette',     label: 'CASSETTES' },
  { key: 'music',        label: 'MUSIC' },
  { key: 'subscription', label: 'EARLY ACCESS' },
];

const hasCategory = (product: Product, filter: Filter): boolean => {
  const cats = Array.isArray(product.category) ? product.category : [product.category];
  return cats.includes(filter);
};

export default function ProductGallery() {
  const [products, setProducts] = useState<Product[]>(staticProducts as Product[]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, product_sizes(size, stock), product_colors(id, color_name, color_hex, stock), product_images(id, url, sort_order)')
          .eq('active', true)
          .order('created_at', { ascending: false });

        if (!error && data?.length) {
          setProducts(data as Product[]);
        }
      } catch {
        // fall back to static data
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = filter === 'all' ? products : products.filter(p => hasCategory(p, filter));

  return (
    <section id="shop" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-heading text-xs tracking-[0.5em] text-gold uppercase mb-3">
            SANELi BROOKLYN NY
          </p>
          <h2 className="font-heading text-5xl md:text-7xl tracking-widest text-black uppercase mb-4">
            THE COLLECTION
          </h2>
          <div className="w-10 h-px bg-gold mx-auto mb-10" />

          <div className="inline-flex flex-wrap justify-center">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`font-heading text-xs tracking-[0.3em] px-6 py-3 border-y border-r first:border-l transition-all duration-200 ${
                  filter === key
                    ? 'bg-charcoal text-white border-charcoal'
                    : 'bg-white text-black border-gray-200 hover:border-gray-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3 animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="h-3 bg-gray-100 w-3/4" />
                <div className="h-3 bg-gray-100 w-1/4" />
                <div className="h-10 bg-gray-100" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center font-body text-gray-400 py-16">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
