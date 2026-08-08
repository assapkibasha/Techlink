# Techlink

A storefront for **Techlink**, an electronics shop selling phones (iPhone, Samsung,
Google Pixel) and computers. Customers browse the catalogue, add products to an
order, preview the exact message, and send it — the whole order arrives as a
**WhatsApp chat message**. No accounts, no checkout forms, no backend.

## How it works

- **Your stock** lives in [`js/products.js`](js/products.js) — plain JavaScript,
  edit it like a list. Products you add there show an "In store" badge and are
  pinned to the top of the catalogue.
- **Demo products** (with photos) are fetched at runtime from
  [dummyjson.com](https://dummyjson.com), a free demo-product API, so the shop
  looks stocked from day one. Turn them off in `js/config.js` with
  `SHOW_DEMO_PRODUCTS: false` once real stock is in.
- **Ordering**: every product has an *Order on WhatsApp* button, and the order
  drawer composes a full multi-item message. Both open `wa.me` links with the
  message pre-filled.

## Setup (do these before going live)

1. **WhatsApp number** — open [`js/config.js`](js/config.js) and replace the
   placeholder `WHATSAPP_NUMBER` with the shop's real number
   (international format, digits only, e.g. `2507XXXXXXXX`).
2. **Logo** — replace [`assets/logo.svg`](assets/logo.svg) with the real logo
   (keep the same filename, or update the two `<img>` tags in `index.html`).
3. **Currency** — in `js/config.js`, set `CURRENCY` (e.g. `"RWF "`) and
   `EXCHANGE_RATE` (multiplier applied to the demo products' US-dollar prices).
4. **Products** — add real stock to `js/products.js`. Put product photos in
   `assets/img/` and reference them from each product's `image` field.
   The `.svg` files there now are placeholders — replace them with real photos.

## Run it

It's a static site — no build step, no dependencies.

```powershell
# from the project folder, any static server works, e.g.:
python -m http.server 8080
# then open http://localhost:8080
```

Or deploy the folder as-is to GitHub Pages, Netlify, Vercel, or any web host.

> Note: open it through a server (or a host), not by double-clicking
> `index.html` — browsers block the demo-product fetch on `file://` pages.

## Tech stack

- Plain HTML + CSS + JavaScript (no framework, no build step)
- Google Fonts: Unbounded (display), Hanken Grotesk (body), Spline Sans Mono (prices)
- [dummyjson.com](https://dummyjson.com) for demo product data
- `wa.me` deep links for WhatsApp ordering
