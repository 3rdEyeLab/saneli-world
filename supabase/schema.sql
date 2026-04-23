-- SANELi World — Supabase Schema
-- Run this in your Supabase SQL editor

-- ─── Products ────────────────────────────────────────────────────────────────
create table if not exists products (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text not null default '',
  price        decimal(10,2) not null,
  category     text not null check (category in ('tshirt', 'vinyl')),
  image_url    text not null default '',
  badge        text,
  active       boolean not null default true,
  stock        integer not null default 0,  -- used for vinyl (no sizes)
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ─── Product Sizes (tshirts) ─────────────────────────────────────────────────
create table if not exists product_sizes (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size       text not null,
  stock      integer not null default 0,
  unique(product_id, size)
);

-- ─── Orders ──────────────────────────────────────────────────────────────────
create table if not exists orders (
  id                 uuid primary key default gen_random_uuid(),
  stripe_session_id  text unique not null,
  customer_email     text not null,
  customer_name      text,
  status             text not null default 'paid'
                       check (status in ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  subtotal           decimal(10,2) not null,
  discount_amount    decimal(10,2) not null default 0,
  total              decimal(10,2) not null,
  discount_code      text,
  shipping_address   jsonb,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- ─── Order Items ─────────────────────────────────────────────────────────────
create table if not exists order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  product_id   uuid references products(id) on delete set null,
  product_name text not null,
  size         text,
  quantity     integer not null,
  unit_price   decimal(10,2) not null,
  created_at   timestamptz default now()
);

-- ─── Newsletter Subscribers ───────────────────────────────────────────────────
create table if not exists newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  list_type  text not null default 'newsletter'
               check (list_type in ('newsletter','early_access','both')),
  active     boolean not null default true,
  created_at timestamptz default now()
);

-- ─── Discount Codes ──────────────────────────────────────────────────────────
create table if not exists discount_codes (
  id               uuid primary key default gen_random_uuid(),
  code             text unique not null,
  discount_percent integer not null check (discount_percent between 1 and 100),
  max_uses         integer,
  uses_count       integer not null default 0,
  expires_at       timestamptz,
  active           boolean not null default true,
  created_at       timestamptz default now()
);

-- ─── Notify-Me Waitlist ───────────────────────────────────────────────────────
create table if not exists notify_waitlist (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  email      text not null,
  size       text,
  notified   boolean not null default false,
  created_at timestamptz default now(),
  unique(product_id, email, size)
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table products             enable row level security;
alter table product_sizes        enable row level security;
alter table orders               enable row level security;
alter table order_items          enable row level security;
alter table newsletter_subscribers enable row level security;
alter table discount_codes       enable row level security;
alter table notify_waitlist      enable row level security;

-- Public can read active products and their sizes
create policy "Public read active products"
  on products for select using (active = true);

create policy "Public read product sizes"
  on product_sizes for select using (true);

-- Public can read active discount codes (for frontend validation display)
create policy "Public read active discounts"
  on discount_codes for select using (active = true);

-- ─── Supabase Storage ─────────────────────────────────────────────────────────
-- Run this separately in the Storage section of your Supabase dashboard:
-- 1. Create a bucket named: product-images
-- 2. Set it to Public
-- 3. That's it — the admin panel will upload images there

-- ─── Seed: Initial discount code ─────────────────────────────────────────────
insert into discount_codes (code, discount_percent, max_uses)
values ('LAUNCH20', 20, 100)
on conflict (code) do nothing;
