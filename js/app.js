/* ============================================================
   TECHLINK — storefront logic
   Loads products (your stock + demo products from dummyjson.com),
   renders the catalogue, and composes WhatsApp orders.
   ============================================================ */

(function () {
  "use strict";

  // ---------- category model ----------

  const CATEGORIES = [
    { key: "all", label: "All products" },
    { key: "iphone", label: "iPhone" },
    { key: "samsung", label: "Samsung" },
    { key: "pixel", label: "Google Pixel" },
    { key: "computers", label: "Computers" },
    { key: "tablets", label: "Tablets" },
    { key: "accessories", label: "Accessories" },
    { key: "other", label: "Other phones" },
  ];

  const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]));

  // dummyjson.com is a free demo-product API; its categories are
  // mapped into Techlink's own categories below.
  const DEMO_API = "https://dummyjson.com/products/category/";
  const DEMO_CATEGORIES = ["smartphones", "laptops", "tablets", "mobile-accessories"];

  // ---------- state ----------

  const state = {
    products: [],
    filter: "all",
    query: "",
    sort: "featured",
    order: new Map(), // id -> quantity
  };

  // ---------- elements ----------

  const $ = (id) => document.getElementById(id);
  const grid = $("product-grid");
  const chipRail = $("chip-rail");
  const drawer = $("drawer");
  const overlay = $("overlay");
  const modal = $("modal");

  let lastFocused = null;
  let modalProduct = null;

  // ---------- helpers ----------

  function formatPrice(value) {
    const n = Math.round(value);
    return CONFIG.CURRENCY + n.toLocaleString("en-US");
  }

  function waLink(message) {
    return (
      "https://wa.me/" +
      CONFIG.WHATSAPP_NUMBER +
      "?text=" +
      encodeURIComponent(message)
    );
  }

  function categorize(apiProduct) {
    const t = (apiProduct.title + " " + (apiProduct.brand || "")).toLowerCase();
    if (apiProduct.category === "laptops") return "computers";
    if (apiProduct.category === "tablets") return "tablets";
    if (apiProduct.category === "mobile-accessories") return "accessories";
    if (t.includes("iphone") || t.includes("apple")) return "iphone";
    if (t.includes("samsung") || t.includes("galaxy")) return "samsung";
    if (t.includes("pixel")) return "pixel";
    return "other";
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => (toast.hidden = true), 2200);
  }

  // ---------- data loading ----------

  function normalizeLocal(p) {
    return { ...p, source: "store", rating: null };
  }

  function normalizeDemo(p) {
    return {
      id: "demo-" + p.id,
      title: p.title,
      category: categorize(p),
      price: p.price * CONFIG.EXCHANGE_RATE,
      image: p.thumbnail,
      description: p.description,
      stock: p.stock,
      rating: p.rating,
      featured: false,
      source: "demo",
    };
  }

  async function loadProducts() {
    state.products = LOCAL_PRODUCTS.map(normalizeLocal);

    if (CONFIG.SHOW_DEMO_PRODUCTS) {
      const results = await Promise.allSettled(
        DEMO_CATEGORIES.map((c) =>
          fetch(DEMO_API + c + "?limit=0").then((r) => {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json();
          })
        )
      );
      for (const result of results) {
        if (result.status === "fulfilled" && result.value.products) {
          state.products.push(...result.value.products.map(normalizeDemo));
        }
      }
    }

    $("grid-loading").hidden = true;
    renderChips();
    renderGrid();
    renderHeroCards();
  }

  // ---------- rendering: hero ----------

  function renderHeroCards() {
    const featured = state.products.filter((p) => p.featured).slice(0, 2);
    const demo = state.products.filter((p) => p.source === "demo" && p.category === "iphone");
    const picks = featured.concat(demo.slice(0, 1)).slice(0, 3);
    $("hero-cards").innerHTML = picks
      .map(
        (p) => `
        <div class="hero-card">
          <img src="${p.image}" alt="" loading="lazy" />
          <strong>${escapeHtml(p.title)}</strong>
          <span>${formatPrice(p.price)}</span>
        </div>`
      )
      .join("");
  }

  // ---------- rendering: chips ----------

  function renderChips() {
    chipRail.innerHTML = CATEGORIES.map((c) => {
      const count =
        c.key === "all"
          ? state.products.length
          : state.products.filter((p) => p.category === c.key).length;
      if (count === 0 && c.key !== "all") return "";
      return `
        <button class="chip" role="tab" data-cat="${c.key}"
          aria-selected="${state.filter === c.key}">
          ${c.label} <span class="count">${count}</span>
        </button>`;
    }).join("");
  }

  // ---------- rendering: grid ----------

  function visibleProducts() {
    let list = state.products.slice();

    if (state.filter !== "all") {
      list = list.filter((p) => p.category === state.filter);
    }
    if (state.query) {
      const q = state.query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      );
    }

    switch (state.sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default: // featured: own stock first, then featured, then rating
        list.sort(
          (a, b) =>
            (b.source === "store") - (a.source === "store") ||
            (b.featured === true) - (a.featured === true) ||
            (b.rating || 0) - (a.rating || 0)
        );
    }
    return list;
  }

  function renderGrid() {
    const list = visibleProducts();
    $("result-count").textContent = list.length + " product" + (list.length === 1 ? "" : "s");
    $("grid-empty").hidden = list.length > 0;

    grid.innerHTML = list
      .map((p, i) => {
        const inOrder = state.order.has(p.id);
        return `
        <article class="card" style="animation-delay:${Math.min(i * 0.03, 0.3)}s">
          <button class="card-media" data-view="${p.id}" aria-label="View ${escapeHtml(p.title)}">
            <img src="${p.image}" alt="${escapeHtml(p.title)}" loading="lazy" />
            ${p.source === "store" ? '<span class="badge-store">In store</span>' : ""}
          </button>
          <div class="card-body">
            <span class="tag">${CATEGORY_LABELS[p.category] || p.category}</span>
            <button class="card-title" data-view="${p.id}">${escapeHtml(p.title)}</button>
            <span class="card-price">${formatPrice(p.price)}</span>
            <div class="card-actions">
              <button class="add ${inOrder ? "added" : ""}" data-add="${p.id}">
                ${inOrder ? "✓ In order" : "Add to order"}
              </button>
              <a class="wa" href="${waLink(singleOrderMessage(p))}" target="_blank" rel="noopener"
                 aria-label="Order ${escapeHtml(p.title)} on WhatsApp">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C7 3 3 6.9 3 11.7c0 2.7 1.3 5 3.3 6.6L5.6 21l3-1.2c1 .3 2.2.5 3.4.5 5 0 9-3.9 9-8.7S17 3 12 3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
              </a>
            </div>
          </div>
        </article>`;
      })
      .join("");
  }

  // ---------- order (cart) ----------

  function orderItems() {
    const items = [];
    for (const [id, qty] of state.order) {
      const product = state.products.find((p) => p.id === id);
      if (product) items.push({ product, qty });
    }
    return items;
  }

  function orderTotal() {
    return orderItems().reduce((sum, it) => sum + it.product.price * it.qty, 0);
  }

  function orderMessage() {
    const lines = [`Hello ${CONFIG.SHOP_NAME}! I would like to order:`, ""];
    for (const { product, qty } of orderItems()) {
      lines.push(`• ${qty} × ${product.title} — ${formatPrice(product.price * qty)}`);
    }
    lines.push("", `Estimated total: ${formatPrice(orderTotal())}`, "", "My name: ");
    return lines.join("\n");
  }

  function singleOrderMessage(product) {
    return (
      `Hello ${CONFIG.SHOP_NAME}! I am interested in:\n\n` +
      `• ${product.title} — ${formatPrice(product.price)}\n\n` +
      `Is it available?`
    );
  }

  function saveOrder() {
    try {
      localStorage.setItem("techlink-order", JSON.stringify([...state.order]));
    } catch (e) {
      /* private mode — order just won't persist */
    }
  }

  function restoreOrder() {
    try {
      const saved = JSON.parse(localStorage.getItem("techlink-order") || "[]");
      state.order = new Map(saved);
    } catch (e) {
      state.order = new Map();
    }
  }

  function setQty(id, qty) {
    if (qty <= 0) state.order.delete(id);
    else state.order.set(id, qty);
    saveOrder();
    renderOrderUI();
    renderGrid();
  }

  function renderOrderUI() {
    const items = orderItems();
    const count = items.reduce((n, it) => n + it.qty, 0);

    const badge = $("order-count");
    badge.hidden = count === 0;
    badge.textContent = count;

    $("drawer-empty").hidden = items.length > 0;
    $("composer").hidden = items.length === 0;
    $("drawer-foot").hidden = items.length === 0;

    $("drawer-items").innerHTML = items
      .map(
        ({ product, qty }) => `
        <li class="drawer-item">
          <img src="${product.image}" alt="" />
          <div class="drawer-item-info">
            <strong>${escapeHtml(product.title)}</strong>
            <span>${formatPrice(product.price)}</span>
          </div>
          <div class="qty" aria-label="Quantity of ${escapeHtml(product.title)}">
            <button data-qty="-1" data-id="${product.id}" aria-label="Remove one">−</button>
            <span>${qty}</span>
            <button data-qty="1" data-id="${product.id}" aria-label="Add one">+</button>
          </div>
        </li>`
      )
      .join("");

    if (items.length > 0) {
      $("bubble").textContent = orderMessage();
      $("drawer-total").textContent = formatPrice(orderTotal());
      $("send-order").href = waLink(orderMessage());
    }
  }

  // ---------- drawer / modal open & close ----------

  function openDrawer() {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    drawer.hidden = false;
    document.body.style.overflow = "hidden";
    $("close-drawer").focus();
  }

  function closeDrawer() {
    overlay.hidden = true;
    drawer.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  function openModal(product) {
    modalProduct = product;
    lastFocused = document.activeElement;

    $("modal-img").src = product.image;
    $("modal-img").alt = product.title;
    $("modal-tag").textContent = CATEGORY_LABELS[product.category] || product.category;
    $("modal-title").textContent = product.title;
    $("modal-desc").textContent = product.description || "";
    $("modal-price").textContent = formatPrice(product.price);
    $("modal-wa").href = waLink(singleOrderMessage(product));

    const meta = [];
    if (product.source === "store") meta.push("In store now");
    if (product.stock === 0) meta.push("Out of stock — ask us");
    else if (product.stock != null) meta.push(product.stock + " available");
    if (product.rating) meta.push("★ " + product.rating.toFixed(1));
    $("modal-meta").innerHTML = meta
      .map((m) => `<span class="meta-chip">${escapeHtml(m)}</span>`)
      .join("");

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $("close-modal").focus();
  }

  function closeModal() {
    modal.hidden = true;
    modalProduct = null;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  // ---------- events ----------

  function bindEvents() {
    $("open-order").addEventListener("click", () => {
      renderOrderUI();
      openDrawer();
    });
    $("close-drawer").addEventListener("click", closeDrawer);
    overlay.addEventListener("click", closeDrawer);
    $("close-modal").addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!modal.hidden) closeModal();
      else if (!drawer.hidden) closeDrawer();
    });

    chipRail.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-cat]");
      if (!chip) return;
      state.filter = chip.dataset.cat;
      renderChips();
      renderGrid();
    });

    $("search-input").addEventListener("input", (e) => {
      state.query = e.target.value.trim();
      renderGrid();
    });

    $("sort-select").addEventListener("change", (e) => {
      state.sort = e.target.value;
      renderGrid();
    });

    grid.addEventListener("click", (e) => {
      const addBtn = e.target.closest("[data-add]");
      if (addBtn) {
        const id = addBtn.dataset.add;
        if (state.order.has(id)) {
          openDrawer();
          renderOrderUI();
        } else {
          setQty(id, 1);
          showToast("Added to your order");
        }
        return;
      }
      const viewBtn = e.target.closest("[data-view]");
      if (viewBtn) {
        const product = state.products.find((p) => p.id === viewBtn.dataset.view);
        if (product) openModal(product);
      }
    });

    $("drawer-items").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-qty]");
      if (!btn) return;
      const id = btn.dataset.id;
      const current = state.order.get(id) || 0;
      setQty(id, current + Number(btn.dataset.qty));
      renderOrderUI();
    });

    $("modal-add").addEventListener("click", () => {
      if (!modalProduct) return;
      setQty(modalProduct.id, (state.order.get(modalProduct.id) || 0) + 1);
      showToast("Added to your order");
      closeModal();
    });

    document.querySelectorAll("[data-cat]").forEach((el) => {
      if (el.tagName === "A") {
        el.addEventListener("click", () => {
          state.filter = el.dataset.cat;
          renderChips();
          renderGrid();
        });
      }
    });
  }

  // ---------- static bits ----------

  function initStatic() {
    $("year").textContent = new Date().getFullYear();

    const greeting = `Hello ${CONFIG.SHOP_NAME}! I have a question about your products.`;
    $("hero-chat").href = waLink(greeting);
    $("footer-wa").href = waLink(greeting);
    $("footer-number").textContent = "+" + CONFIG.WHATSAPP_NUMBER;
  }

  // ---------- go ----------

  restoreOrder();
  initStatic();
  bindEvents();
  renderOrderUI();
  loadProducts().catch(() => {
    $("grid-loading").hidden = true;
    renderChips();
    renderGrid();
    renderHeroCards();
  });
})();
