/* ============================================================
   TECHLINK — your own stock
   Add, edit or remove products here. Each product needs:
     id          any unique text, keep the "local-" prefix
     title       product name shown to customers
     category    one of: "iphone" | "samsung" | "pixel"
                 | "computers" | "tablets" | "accessories" | "other"
     price       number (in the same currency as CONFIG.CURRENCY)
     image       path to a photo — put photos in assets/img/
                 and reference them like "assets/img/my-photo.jpg"
     description one or two sentences shown on the product page
     stock       how many you have (0 shows "out of stock")
     featured    true to pin it near the top of the catalogue
   ============================================================ */

const LOCAL_PRODUCTS = [
  {
    id: "local-pixel-9-pro",
    title: "Google Pixel 9 Pro 256GB",
    category: "pixel",
    price: 999,
    image: "assets/img/pixel-9-pro.svg",
    description:
      "Google's flagship with the Tensor G4 chip, a 50MP pro triple camera and 7 years of software updates. 256GB storage, 16GB RAM.",
    stock: 4,
    featured: true,
  },
  {
    id: "local-pixel-8a",
    title: "Google Pixel 8a 128GB",
    category: "pixel",
    price: 499,
    image: "assets/img/pixel-8a.svg",
    description:
      "The best camera you can get at this price. Tensor G3, 64MP main camera, all-day battery and 7 years of updates.",
    stock: 6,
    featured: true,
  },
  {
    id: "local-galaxy-s24-ultra",
    title: "Samsung Galaxy S24 Ultra 256GB",
    category: "samsung",
    price: 1199,
    image: "assets/img/galaxy-s24-ultra.svg",
    description:
      "Samsung's top phone: 200MP camera, built-in S Pen, titanium frame and a 6.8\" QHD+ display.",
    stock: 3,
    featured: true,
  },
  {
    id: "local-iphone-15-pro",
    title: "iPhone 15 Pro 128GB",
    category: "iphone",
    price: 999,
    image: "assets/img/iphone-15-pro.svg",
    description:
      "A17 Pro chip, 48MP main camera, titanium design and USB-C. Unlocked, dual SIM.",
    stock: 5,
    featured: true,
  },
  {
    id: "local-hp-elitebook",
    title: "HP EliteBook 840 G8 — i5, 16GB, 512GB SSD",
    category: "computers",
    price: 650,
    image: "assets/img/hp-elitebook.svg",
    description:
      "Business-grade 14\" laptop. Intel Core i5-1135G7, 16GB RAM, 512GB SSD, backlit keyboard, Windows 11 Pro.",
    stock: 2,
    featured: false,
  },
];
