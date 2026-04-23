'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { CartItem, Product, DiscountCode } from '@/types';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  discount: DiscountCode | null;
  discountAmount: number;
  addItem: (product: Product, size?: string) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  applyDiscount: (code: string) => Promise<{ success: boolean; message: string }>;
  removeDiscount: () => void;
  subtotal: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [discount, setDiscount] = useState<DiscountCode | null>(null);

  const addItem = useCallback((product: Product, size?: string) => {
    setItems(prev => {
      const existing = prev.find(
        item => item.product.id === product.id && item.size === size
      );
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, size }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, size?: string) => {
    setItems(prev =>
      prev.filter(item => !(item.product.id === productId && item.size === size))
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, size?: string) => {
      if (quantity <= 0) { removeItem(productId, size); return; }
      setItems(prev =>
        prev.map(item =>
          item.product.id === productId && item.size === size
            ? { ...item, quantity }
            : item
        )
      );
    },
    [removeItem]
  );

  const applyDiscount = useCallback(async (code: string) => {
    try {
      const res = await fetch('/api/discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.error ?? 'Invalid code' };
      setDiscount({ code: data.code, discount_percent: data.discount_percent });
      return { success: true, message: `${data.discount_percent}% discount applied!` };
    } catch {
      return { success: false, message: 'Failed to apply discount' };
    }
  }, []);

  const removeDiscount = useCallback(() => setDiscount(null), []);
  const clearCart = useCallback(() => { setItems([]); setDiscount(null); }, []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const discountAmount = discount
    ? parseFloat(((subtotal * discount.discount_percent) / 100).toFixed(2))
    : 0;
  const total = Math.max(0, subtotal - discountAmount);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items, isOpen, discount, discountAmount,
        addItem, removeItem, updateQuantity, clearCart,
        openCart, closeCart, applyDiscount, removeDiscount,
        subtotal, total, itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
