/* ============================================================
   TECHLINK — shop settings
   This is the ONLY file you need to touch for day-to-day setup.
   ============================================================ */

const CONFIG = {
  // The shop's WhatsApp number, international format, digits only
  // (country code + number, no "+", no spaces).
  // !!! PLACEHOLDER — replace with the real number before going live !!!
  WHATSAPP_NUMBER: "250700000000",

  SHOP_NAME: "Techlink",

  // Currency shown next to prices.
  CURRENCY: "$",

  // Demo products from the internet are priced in US dollars.
  // Set this to convert them (e.g. 1450 to show Rwandan francs),
  // and change CURRENCY to match (e.g. "RWF ").
  EXCHANGE_RATE: 1,

  // Set to false to hide the demo products fetched from the internet
  // and show only your own products from js/products.js.
  SHOW_DEMO_PRODUCTS: true,
};
