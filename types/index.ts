export interface ProductSize {
  size: string;
  stock: number;
}

export interface ProductColor {
  id?: string;
  color_name: string;
  color_hex: string;
  stock: number;
}

export interface ProductImage {
  id?: string;
  url: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string | string[];
  image_url?: string;
  badge?: string;
  active?: boolean;
  stock?: number;
  product_sizes?: ProductSize[];
  product_colors?: ProductColor[];
  product_images?: ProductImage[];
  // legacy fields for static data compatibility
  image?: string;
  sizes?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

export interface DiscountCode {
  code: string;
  discount_percent: number;
}

export interface Order {
  id: string;
  stripe_session_id: string;
  customer_email: string;
  customer_name?: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  discount_amount: number;
  total: number;
  discount_code?: string;
  shipping_address?: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  order_items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  size?: string;
  quantity: number;
  unit_price: number;
}
