'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import NotifyMeModal from './NotifyMeModal';
import type { Product } from '@/types';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.product_sizes?.[1]?.size ?? product.sizes?.[1]
  );
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const [showNotify, setShowNotify] = useState(false);

  // Determine stock for selected size or product
  const getStock = (size?: string): number => {
    if (product.product_sizes?.length) {
      const s = product.product_sizes.find(ps => ps.size === size);
      return s?.stock ?? 0;
    }
    return product.stock ?? 999;
  };

  const selectedStock = getStock(selectedSize);
  const isSoldOut = selectedStock === 0;
  const isLowStock = selectedStock > 0 && selectedStock <= 4;

  const imgSrc = product.image_url || product.image || '';

  const handleAdd = () => {
    if (isSoldOut) return;
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // Build size list from either DB or static data
  const sizeList: { size: string; stock: number }[] =
    product.product_sizes?.length
      ? product.product_sizes
      : (product.sizes?.map(s => ({ size: s, stock: 999 })) ?? []);

  return (
    <>
      <div className="group flex flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden mb-4">
          {product.badge && (
            <span className="absolute top-3 left-3 z-10 bg-charcoal text-white font-heading text-[10px] tracking-[0.25em] px-2.5 py-1 uppercase">
              {product.badge}
            </span>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
              <span className="font-heading text-xs tracking-[0.4em] text-black uppercase">Sold Out</span>
            </div>
          )}
          {!imgError && imgSrc ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <PlaceholderImage category={product.category} />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-sm tracking-[0.15em] uppercase text-black leading-snug flex-1">
              {product.name}
            </h3>
            <span className="font-body text-sm text-black font-medium whitespace-nowrap">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          {/* Sizes */}
          {sizeList.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {sizeList.map(({ size, stock }) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  disabled={stock === 0}
                  className={`font-heading text-[10px] tracking-wider px-2.5 py-1 border transition-colors duration-150 ${
                    stock === 0
                      ? 'opacity-30 cursor-not-allowed border-gray-100 text-gray-400 line-through'
                      : selectedSize === size
                        ? 'bg-charcoal text-white border-charcoal'
                        : 'bg-white text-black border-gray-200 hover:border-charcoal'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}

          {isLowStock && !isSoldOut && (
            <p className="font-heading text-[10px] tracking-[0.25em] text-gold uppercase">
              Only {selectedStock} left
            </p>
          )}

          {/* CTA */}
          {isSoldOut ? (
            <button
              onClick={() => setShowNotify(true)}
              className="mt-1 w-full bg-white text-black border border-charcoal font-heading text-xs tracking-[0.25em] py-3.5 uppercase hover:bg-charcoal hover:text-white transition-colors duration-200"
            >
              NOTIFY ME
            </button>
          ) : (
            <button
              onClick={handleAdd}
              className={`mt-1 w-full font-heading text-xs tracking-[0.25em] py-3.5 uppercase transition-all duration-300 ${
                added ? 'bg-gold text-white' : 'bg-charcoal text-white hover:bg-gold'
              }`}
            >
              {added ? 'ADDED ✓' : 'ADD TO BAG'}
            </button>
          )}
        </div>
      </div>

      {showNotify && (
        <NotifyMeModal
          productId={product.id}
          productName={product.name}
          size={selectedSize}
          onClose={() => setShowNotify(false)}
        />
      )}
    </>
  );
}

function PlaceholderImage({ category }: { category: 'tshirt' | 'vinyl' }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 gap-4">
      {category === 'tshirt' ? (
        <svg className="w-24 h-24 text-gray-200" viewBox="0 0 100 100" fill="currentColor">
          <path d="M20 18 L4 38 L22 44 L22 86 L78 86 L78 44 L96 38 L80 18 C70 30 60 34 50 34 C40 34 30 30 20 18Z" />
        </svg>
      ) : (
        <svg className="w-24 h-24 text-gray-200" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="46" />
          <circle cx="50" cy="50" r="30" fill="white" fillOpacity="0.12" />
          <circle cx="50" cy="50" r="9" fill="white" fillOpacity="0.35" />
        </svg>
      )}
      <span className="font-body text-[11px] text-gray-400 tracking-widest uppercase">Image Coming Soon</span>
    </div>
  );
}
