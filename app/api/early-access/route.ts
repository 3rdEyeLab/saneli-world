import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const { data } = await supabaseAdmin
    .from('products')
    .select('*')
    .contains('category', ['subscription'])
    .limit(1)
    .maybeSingle();

  if (!data) return NextResponse.json(null);
  return NextResponse.json(data);
}
