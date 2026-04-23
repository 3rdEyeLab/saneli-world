import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const { email, productId, size } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }
  if (!productId) {
    return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('notify_waitlist')
    .upsert(
      {
        email: email.toLowerCase().trim(),
        product_id: productId,
        size: size ?? null,
        notified: false,
      },
      { onConflict: 'product_id,email,size' }
    );

  if (error) {
    console.error('Notify waitlist error:', error);
    return NextResponse.json({ error: 'Failed to add to waitlist' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
