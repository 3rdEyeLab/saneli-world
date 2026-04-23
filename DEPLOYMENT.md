# SANELi — Deploy to Hostinger

## Step 1: First-time project setup

Open a terminal in the project folder (Desktop/Elias) and run:

```bash
npm install
```

---

## Step 2: Add your logo

Save your SANELi logo image as:

```
public/logo.png
```

This file is referenced on the landing page and navbar.

---

## Step 3: Add product images

Place your T-shirt and vinyl mockup images in:

```
public/products/
  tshirt-01.jpg   ← SANELi Crown Tee Black
  tshirt-02.jpg   ← SANELi BK Tee White
  tshirt-03.jpg   ← SANELi Mic Tee Charcoal
  vinyl-01.jpg    ← SANELi Vol. 1
  vinyl-02.jpg    ← SANELi Vol. 2
  vinyl-03.jpg    ← SANELi Crown Edition
```

Until images are added, the cards show a styled placeholder automatically.

---

## Step 4: Update your real links

Open these files and replace the placeholder values:

**`components/MusicSection.tsx`** — update Spotify, Apple Music, YouTube URLs  
**`components/HomePage.tsx`** — update Instagram and email in the footer  
**`components/CartDrawer.tsx`** — update the mailto: checkout link (or swap for Stripe)  
**`data/products.ts`** — update prices, names, and add stripeLink values  

---

## Step 5: Test locally

```bash
npm run dev
```

Open `http://localhost:3000` in your browser. Click the logo to enter, test the cart, scroll through sections.

---

## Step 6: Build for production

```bash
npm run build
```

This generates a static `out/` folder — everything Hostinger needs.

---

## Step 7: Deploy to Hostinger

### Option A — File Manager (easiest)

1. Log in to Hostinger hPanel → **File Manager**
2. Navigate to `public_html/`
3. Delete any existing default files (index.html, etc.)
4. Upload ALL contents of the `out/` folder directly into `public_html/`
5. Your site is live

### Option B — FTP with FileZilla (recommended for large uploads)

1. In Hostinger hPanel → **FTP Accounts** → create an FTP user
2. Open FileZilla:
   - Host: `ftp.yourdomain.com`
   - Username: your FTP username
   - Password: your FTP password
   - Port: 21
3. Connect → navigate to `public_html/` on the right
4. Drag all contents of the local `out/` folder to `public_html/`

---

## Step 8: Connect your custom domain

1. In Hostinger hPanel → **Domains** → point your domain to the hosting
2. Wait 10–60 min for DNS to propagate
3. Enable **SSL** (free) in hPanel → **SSL** → Install

---

## Adding Stripe Payments (when ready)

### Simplest approach: Stripe Payment Links

1. Create a [Stripe account](https://stripe.com)
2. In Stripe Dashboard → **Payment Links** → Create link for each product
3. Copy the link (looks like `https://buy.stripe.com/xxxxxx`)
4. Open `data/products.ts` and uncomment/update `stripeLink` for each product
5. Open `components/CartDrawer.tsx` and replace the `href` on the CHECKOUT button:

```tsx
// Before (email fallback):
href="mailto:your@email.com?subject=SANELi%20Order%20Request"

// After (Stripe):
href="https://buy.stripe.com/YOUR_STRIPE_LINK"
```

For a full shopping cart with multiple items that goes to one Stripe checkout,
you would need a backend (Node.js on Hostinger's VPS plan or a platform like
Vercel/Railway). Message me when you're ready for that step.

---

## Updating the site after changes

1. Make edits to any file
2. Run `npm run build` again
3. Upload the new `out/` folder contents to `public_html/` (overwrite existing)

---

## File structure overview

```
Elias/
├── app/
│   ├── layout.tsx        ← metadata, fonts
│   ├── page.tsx          ← landing ↔ home transition logic
│   └── globals.css       ← Tailwind + global styles
├── components/
│   ├── LandingPage.tsx   ← logo enter screen
│   ├── Navbar.tsx        ← sticky nav with cart icon
│   ├── HomePage.tsx      ← main page wrapper
│   ├── ProductGallery.tsx← shop section with filter tabs
│   ├── ProductCard.tsx   ← individual product card
│   ├── CartDrawer.tsx    ← slide-in cart
│   └── MusicSection.tsx  ← Spotify / Apple / YouTube
├── context/
│   └── CartContext.tsx   ← cart state (add, remove, qty)
├── data/
│   └── products.ts       ← product catalog — edit here
├── types/
│   └── index.ts          ← TypeScript types
├── public/
│   ├── logo.png          ← YOUR LOGO GOES HERE
│   └── products/         ← your product mockup images
└── out/                  ← generated after npm run build (upload this)
```
