# Handcrafted-Haven

![Project](https://img.shields.io/badge/Project-Handcrafted%20Haven-5C3D2E?style=for-the-badge&labelColor=2C2018)
![Course](https://img.shields.io/badge/WDD%20430-Group%206-C7724A?style=for-the-badge&labelColor=5C3D2E)
![Theme](https://img.shields.io/badge/Theme-Handmade%20Marketplace-7A9E7E?style=for-the-badge&labelColor=5C3D2E)

**Handcrafted Haven — Group 6 Project for WDD 430**

- **Production URL:** `https://handcrafted-haven-red.vercel.app/`
- **Local URL:** `http://localhost:3000`

Team Members:

- Nyantakyi Francis
- Amon Goes Roca
- Yesid Augusto Romero Ruiz
- Raphael Shawn Taurai
- Leticia Mahomed de Sousa

## Colors

Our primary palette uses earthy, natural tones:

![Background Cream](https://img.shields.io/badge/Background-Cream-F5EFE6?style=flat-square) — main background color, soft and warm

![Primary Clay](https://img.shields.io/badge/Primary-Clay%20%2F%20Terracotta-C7724A?style=flat-square) — primary buttons, links, and call-to-action elements

![Heading Bark Brown](https://img.shields.io/badge/Headings-Bark%20Brown-5C3D2E?style=flat-square) — headings, navbar, footer

![Accent Sage](https://img.shields.io/badge/Accent-Sage%20Green-7A9E7E?style=flat-square) — accents, badges, tags

![Highlight Gold](https://img.shields.io/badge/Highlight-Warm%20Gold-C9A84C?style=flat-square) — highlights, star ratings, special labels

![Text Charcoal](https://img.shields.io/badge/Text-Charcoal-2C2018?style=flat-square) — body text

## Typography

**Headings:** Playfair Display — elegant serif font that feels crafted and refined.

**Accent/Taglines:** Dancing Script — handwritten feel for a personal artisan touch.

**Body Text:** Lato Light/Regular — clean and easy to read for product descriptions and navigation.

## Layout

Clean product grid layout similar to Etsy. Large hero section on the homepage with a welcome message and featured items. Generous white space so products breathe and stand out. Consistent card design for all product listings.

## Navigation

Sticky top navbar in Bark Brown with cream text. Logo on the left, links in the center, cart and profile icons on the right. Mobile-friendly hamburger menu for smaller screens.

## Work Items

1. Homepage — As a visitor, I want to see a homepage with featured products so I know what the site offers.
2. Seller Registration — As an artisan, I want to create a seller account so I can list my products.
3. Seller Profile Page — As a seller, I want a profile page where I can share my story and show my products.
4. Add Product Listing — As a seller, I want to add a product with a title, description, price, and image.
5. Browse Products — As a buyer, I want to browse all products in a catalog view.
6. Filter Products — As a buyer, I want to filter products by category or price range.
7. Product Detail Page — As a buyer, I want to click a product and see its full details.
8. Leave a Review — As a user, I want to leave a star rating and written review on a product.
9. Responsive Design — As a mobile user, I want the site to look good on my phone.
10. Navigation Menu — As a user, I want a clear navigation bar so I can move between pages easily.

## Supabase Setup

This project uses Supabase for authentication, seller/product data, reviews, and order persistence. If the public Supabase variables are missing, the app falls back to local sample data.

### 1) Environment variables

Create a `.env.local` file in the project root and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> You can also use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` instead of `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

For the deployed site, set:

```bash
NEXT_PUBLIC_SITE_URL=https://handcrafted-haven-red.vercel.app/
```

### 2) Database setup

In the Supabase SQL Editor, run these files in order:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

This creates and seeds the main tables used by the app:

- `sellers`
- `products`
- `reviews`
- `clients`
- `orders`
- `order_items`

### 3) Configure authentication callback URLs

In **Supabase Dashboard → Authentication → URL Configuration**, set:

**Site URL**

- `https://handcrafted-haven-red.vercel.app/`

**Additional Redirect URLs**

- `http://localhost:3000/auth/callback`
- `https://handcrafted-haven-red.vercel.app/auth/callback`
- `http://localhost:3000`

These URLs are required so email confirmation and auth redirects can return correctly to the app route:

- `src/app/auth/callback/route.ts`

### 4) Run the app

```bash
pnpm install
pnpm dev
```

Then open:

- Local: `http://localhost:3000`
- Production: `https://handcrafted-haven-red.vercel.app/`

Optional connectivity check:

- `http://localhost:3000/api/supabase/health`

### Supabase integration files

- `src/lib/supabase/config.ts` - environment and site URL handling
- `src/lib/supabase/client.ts` - browser client
- `src/lib/supabase/server.ts` - server/admin clients
- `src/data/marketplace-supabase.ts` - Supabase-backed marketplace access
