'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import type { CartItem } from '@/types';

export default function CartDrawer() {
  const {
    items, isOpen, closeCart, removeItem, updateQuantity,
    subtotal, total, discountAmount, discount, itemCount,
    applyDiscount, removeDiscount,
  } = useCart();

  const [codeInput, setCodeInput] = useState('');
  const [codeStatus, setCodeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [codeMessage, setCodeMessage] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  const handleApplyCode = async () => {
    if (!codeInput.trim()) return;
    setCodeStatus('loading');
    const result = await applyDiscount(codeInput.trim());
    setCodeStatus(result.success ? 'success' : 'error');
    setCodeMessage(result.message);
    if (result.success) setCodeInput('');
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, discountCode: discount?.code }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setCheckingOut(false);
      alert(data.error || 'Checkout failed. Please try again.');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-heading text-2xl tracking-widest uppercase">
            YOUR BAG <span className="text-gray-400">({itemCount})</span>
          </h2>
          <button onClick={closeCart} className="text-gray-400 hover:text-black transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-16 text-center">
              <svg className="w-14 h-14 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
              <p className="font-heading text-base tracking-widest text-gray-400 uppercase">Your bag is empty</p>
              <button onClick={closeCart} className="font-heading text-xs tracking-[0.3em] text-black underline uppercase">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {items.map(item => (
                <CartItemRow
                  key={`${item.product.id}-${item.size}`}
                  item={item}
                  onRemove={() => removeItem(item.product.id, item.size)}
                  onUpdateQty={qty => updateQuantity(item.product.id, qty, item.size)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100 bg-white">
            {/* Discount code */}
            {!discount ? (
              <div className="flex gap-0 mb-4">
                <input
                  type="text"
                  value={codeInput}
                  onChange={e => { setCodeInput(e.target.value.toUpperCase()); setCodeStatus('idle'); }}
                  placeholder="PROMO CODE"
                  className="flex-1 border border-gray-200 border-r-0 px-3 py-2 font-heading text-xs tracking-widest placeholder-gray-300 focus:outline-none focus:border-charcoal uppercase"
                />
                <button
                  onClick={handleApplyCode}
                  disabled={codeStatus === 'loading' || !codeInput}
                  className="bg-charcoal text-white font-heading text-xs tracking-[0.2em] uppercase px-4 py-2 hover:bg-gold transition-colors disabled:opacity-40"
                >
                  {codeStatus === 'loading' ? '...' : 'APPLY'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mb-4 bg-gold/10 px-3 py-2">
                <span className="font-heading text-xs tracking-widest text-gold uppercase">
                  {discount.code} — {discount.discount_percent}% OFF
                </span>
                <button onClick={() => { removeDiscount(); setCodeStatus('idle'); }}
                  className="font-body text-xs text-gray-400 hover:text-red-500 transition-colors">
                  ✕
                </button>
              </div>
            )}

            {codeStatus === 'error' && (
              <p className="font-body text-xs text-red-500 mb-3">{codeMessage}</p>
            )}

            {/* Totals */}
            <div className="flex flex-col gap-1 mb-4">
              <div className="flex justify-between">
                <span className="font-heading text-xs tracking-[0.2em] uppercase text-gray-400">Subtotal</span>
                <span className="font-body text-sm text-black">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="font-heading text-xs tracking-[0.2em] uppercase text-gold">Discount</span>
                  <span className="font-body text-sm text-gold">−${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 mt-1">
                <span className="font-heading text-xs tracking-[0.2em] uppercase text-black">Total</span>
                <span className="font-body text-base font-semibold text-black">${total.toFixed(2)}</span>
              </div>
            </div>

            <p className="font-body text-xs text-gray-400 mb-4 text-center">
              Shipping &amp; taxes calculated at checkout
            </p>

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="block w-full bg-charcoal text-white font-heading text-xs tracking-[0.3em] py-4 text-center hover:bg-gold transition-colors duration-300 uppercase disabled:opacity-60"
            >
              {checkingOut ? 'REDIRECTING...' : 'CHECKOUT WITH STRIPE'}
            </button>
            <button
              onClick={closeCart}
              className="block w-full mt-2 font-heading text-xs tracking-widest text-gray-400 uppercase py-2 hover:text-black transition-colors text-center"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function CartItemRow({ item, onRemove, onUpdateQty }: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQty: (qty: number) => void;
}) {
  const imgSrc = item.product.image_url || item.product.image || '';
  return (
    <div className="flex gap-4 py-4">
      <div className="w-16 h-16 bg-gray-50 flex-shrink-0 overflow-hidden">
        {imgSrc && <img src={imgSrc} alt={item.product.name} className="w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-heading text-xs tracking-widest uppercase text-black truncate">{item.product.name}</p>
        {item.size && <p className="font-body text-xs text-gray-400 mt-0.5">Size: {item.size}</p>}
        <p className="font-body text-xs font-medium text-black mt-1">
          ${(item.product.price * item.quantity).toFixed(2)}
        </p>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center border border-gray-200">
            <button onClick={() => onUpdateQty(item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-black font-body">−</button>
            <span className="w-7 text-center font-body text-xs">{item.quantity}</span>
            <button onClick={() => onUpdateQty(item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-black font-body">+</button>
          </div>
          <button onClick={onRemove} className="font-body text-xs text-gray-400 hover:text-red-500 transition-colors underline">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
