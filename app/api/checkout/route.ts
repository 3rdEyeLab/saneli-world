import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { CartItem } from '@/types';

export async function POST(req: NextRequest) {
  const { items, discountCode } = await req.json() as {
    items: CartItem[];
    discountCode?: string;
  };

  if (!items?.length) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  // Validate discount code
  let discountPercent = 0;
  let validatedCode: string | null = null;

  if (discountCode) {
    const { data } = await supabaseAdmin
      .from('discount_codes')
      .select('code, discount_percent, max_uses, uses_count, expires_at, active')
      .eq('code', discountCode.toUpperCase().trim())
      .single();

    if (
      data &&
      data.active &&
      (!data.expires_at || new Date(data.expires_at) > new Date()) &&
      (data.max_uses === null || data.uses_count < data.max_uses)
    ) {
      discountPercent = data.discount_percent;
      validatedCode = data.code;
    }
  }

  const multiplier = 1 - discountPercent / 100;

  const lineItems = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.product.name + (item.size ? ` / ${item.size}` : ''),
        ...(discountPercent > 0 && {
          description: `Code: ${validatedCode} — ${discountPercent}% off`,
        }),
      },
      unit_amount: Math.round(item.product.price * multiplier * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}`,
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'AU'],
    },
    metadata: {
      discount_code: validatedCode ?? '',
      discount_percent: String(discountPercent),
      items: JSON.stringify(
        items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          size: item.size ?? null,
          quantity: item.quantity,
          price: item.product.price,
        }))
      ),
    },
  });

  return NextResponse.json({ url: session.url });
}
