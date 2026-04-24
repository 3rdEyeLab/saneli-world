import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, product_sizes(size, stock), product_colors(id, color_name, color_hex, stock), product_images(id, url, sort_order)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, price, category, image_url, badge, active, stock, sizes, colors, images } = body;

  if (!name || !price || !category) {
    return NextResponse.json({ error: 'name, price, and category are required' }, { status: 400 });
  }

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .insert({ name, description: description ?? '', price, category, image_url: image_url ?? '', badge: badge || null, active: active ?? true, stock: stock ?? 0 })
    .select('id')
    .single();

  if (error || !product) {
    return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 });
  }

  if (category === 'tshirt' && Array.isArray(sizes) && sizes.length > 0) {
    await supabaseAdmin.from('product_sizes').insert(
      sizes.map((s: { size: string; stock: number }) => ({ product_id: product.id, size: s.size, stock: s.stock ?? 0 }))
    );
  }

  if (Array.isArray(colors) && colors.length > 0) {
    await supabaseAdmin.from('product_colors').insert(
      colors.map((c: { color_name: string; color_hex: string; stock: number }) => ({
        product_id: product.id, color_name: c.color_name, color_hex: c.color_hex, stock: c.stock ?? 0,
      }))
    );
  }

  if (Array.isArray(images) && images.length > 0) {
    await supabaseAdmin.from('product_images').insert(
      images.map((img: { url: string; sort_order: number }) => ({
        product_id: product.id, url: img.url, sort_order: img.sort_order ?? 0,
      }))
    );
  }

  return NextResponse.json({ id: product.id }, { status: 201 });
}
