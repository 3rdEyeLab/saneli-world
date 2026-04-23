# SANELi World — Full Setup Guide
## Supabase → Vercel → Stripe → Go Live

---

## Step 1 — Supabase (Database)

1. Go to [supabase.com](https://supabase.com) → create a free account
2. Click **New Project** → name it `saneli-world`, pick a region close to your users
3. Once created, go to **SQL Editor** → paste the entire contents of `supabase/schema.sql` → click Run
4. Go to **Storage** → **New Bucket** → name it `product-images` → check **Public** → Create
5. Go to **Project Settings → API**:
   - Copy `Project URL` → this is `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon / public` key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key → this is `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## Step 2 — Stripe (Payments)

1. Go to [stripe.com](https://stripe.com) → create account
2. From the Stripe Dashboard, grab your keys (use **Test** keys first):
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → `STRIPE_SECRET_KEY`
3. For webhooks — come back to this after deploying to Vercel (you need the live URL first)

---

## Step 3 — Vercel (Hosting)

1. Push this project to a GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial SANELi World"
   git remote add origin https://github.com/YOUR_USERNAME/saneli-world.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Go to **Environment Variables** and add every variable from `.env.example`:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Supabase |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | from Stripe |
   | `STRIPE_SECRET_KEY` | from Stripe |
   | `STRIPE_WEBHOOK_SECRET` | (set up in next step) |
   | `RESEND_API_KEY` | from Resend (optional) |
   | `RESEND_FROM_EMAIL` | e.g. orders@yourdomain.com |
   | `ADMIN_PASSWORD` | a strong password you choose |
   | `ADMIN_JWT_SECRET` | 32+ random characters |
   | `NEXT_PUBLIC_SITE_URL` | your Vercel URL e.g. https://saneli-world.vercel.app |

5. Click **Deploy** — your site will be live in ~1 minute

---

## Step 4 — Stripe Webhook (after Vercel deploy)

1. In Stripe Dashboard → **Developers → Webhooks** → **Add endpoint**
2. Endpoint URL: `https://YOUR-VERCEL-URL.vercel.app/api/webhooks/stripe`
3. Select event: `checkout.session.completed`
4. Copy the **Signing secret** → add it as `STRIPE_WEBHOOK_SECRET` in Vercel env vars
5. Redeploy Vercel after adding the secret (or it redeployos automatically)

---

## Step 5 — Resend (Order confirmation emails) — Optional

1. Go to [resend.com](https://resend.com) → free account (3,000 emails/month free)
2. Create an API key → add as `RESEND_API_KEY`
3. Add a sender domain OR use `onboarding@resend.dev` for testing
4. Set `RESEND_FROM_EMAIL` to your sender address

---

## Step 6 — Custom Domain (Hostinger → Vercel)

1. In Vercel → your project → **Settings → Domains** → Add your domain
2. Vercel gives you DNS records to add
3. Log in to Hostinger → **Domains → DNS / Nameservers**
4. Add the CNAME or A records Vercel gives you
5. Wait 10–60 min for DNS to propagate
6. SSL is automatic on Vercel

---

## Step 7 — Go Live with Stripe

When ready to take real payments:
1. In Stripe Dashboard, switch from **Test** to **Live** mode
2. Replace your Stripe keys in Vercel env vars with the **live** keys
3. Recreate the webhook endpoint in **Live mode** and update `STRIPE_WEBHOOK_SECRET`
4. Test with a real card for $1

---

## Admin Panel

Your admin panel lives at: `https://your-site.com/admin`

- Login with your `ADMIN_PASSWORD`
- **Dashboard** — revenue, orders, subscriber counts, low stock alerts
- **Products** — add, edit, hide/show products with image upload
- **Orders** — view all orders, update status (Paid → Processing → Shipped → Delivered)

---

## Updating the Site

Any time you push to GitHub, Vercel auto-deploys in ~30 seconds. That's it.

```bash
git add .
git commit -m "update products"
git push
```

---

## Customization Checklist

- [ ] Replace Spotify URL in `components/MusicSection.tsx` (3 platform links + embed `src`)
- [ ] Replace Instagram URL in `components/HomePage.tsx` footer
- [ ] Replace contact email in `components/HomePage.tsx` footer
- [ ] Add your logo: `public/logo.png` (landing page) and `public/mainpagelogo.png` (navbar)
- [ ] Add product images via the Admin Panel after going live
- [ ] Set `ADMIN_PASSWORD` to something strong
- [ ] Add your first products in the Admin Panel

---

## Adding a Discount Code

1. Go to your Supabase Dashboard → **Table Editor → discount_codes**
2. Click **Insert** → fill in: `code`, `discount_percent`, optional `max_uses`, optional `expires_at`
3. Set `active = true`
4. The code works immediately on your site — customers enter it in the cart

A starter code `LAUNCH20` (20% off, max 100 uses) is already seeded in the schema.
