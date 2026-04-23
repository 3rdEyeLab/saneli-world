import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Code required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('discount_codes')
    .select('code, discount_percent, max_uses, uses_count, expires_at, active')
    .eq('code', code.toUpperCase().trim())
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid discount code' }, { status: 404 });
  }

  if (!data.active) {
    return NextResponse.json({ error: 'This code is no longer active' }, { status: 400 });
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This code has expired' }, { status: 400 });
  }

  if (data.max_uses !== null && data.uses_count >= data.max_uses) {
    return NextResponse.json({ error: 'This code has reached its usage limit' }, { status: 400 });
  }

  return NextResponse.json({
    code: data.code,
    discount_percent: data.discount_percent,
  });
}
