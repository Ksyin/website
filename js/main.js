/* Cupcake City - Production-ready vanilla JS (no build tools) */
(function () {
  "use strict";

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const money = (n) => {
    try { return "KES " + Number(n).toLocaleString("en-KE"); }
    catch { return "KES " + n; }
  };

  // ---------- Cart (localStorage) ----------
  const CART_KEY = "cc_cart_v1";

  function readCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }

  function cartCount(items) {
    return items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  }

  function cartTotal(items) {
    return items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);
  }

  function upsertCartItem(productId, variant, qty) {
    const products = window.CC_PRODUCTS || [];
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const items = readCart();
    const key = productId + "::" + (variant || "");
    const existing = items.find(i => i.key === key);

    const cleanQty = Math.max(1, Math.min(99, Number(qty) || 1));
    if (existing) {
      existing.qty += cleanQty;
    } else {
      items.push({
        key,
        id: product.id,
        name: product.name,
        variant: variant || "",
        price: product.price,
        image: product.image,
        qty: cleanQty
      });
    }
    writeCart(items);
    syncCartBadges();
    toast("Added to cart");
  }

  function setCartQty(key, qty) {
    const items = readCart();
    const item = items.find(i => i.key === key);
    if (!item) return;
    const n = Number(qty) || 0;
    if (n <= 0) {
      writeCart(items.filter(i => i.key !== key));
    } else {
      item.qty = Math.max(1, Math.min(99, n));
      writeCart(items);
    }
    syncCartBadges();
  }

  function clearCart() {
    writeCart([]);
    syncCartBadges();
  }

  // ---------- UI: toast ----------
  let toastTimer = null;
  function toast(msg) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  // ---------- Nav ----------
  function setupNav() {
    const btn = $("[data-nav-toggle]");
    const nav = $("[data-site-nav]");
    if (!btn || !nav) return;

    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("open", !expanded);
    });
  }

  function syncCartBadges() {
    const items = readCart();
    const count = cartCount(items);
    $$("[data-cart-count]").forEach(el => (el.textContent = String(count)));
  }

  // ---------- Shop rendering ----------
  function renderShop() {
    const grid = $("#shopGrid");
    if (!grid) return;

    const products = window.CC_PRODUCTS || [];
    const qInput = $("#q");
    const catSelect = $("#category");
    const sortSelect = $("#sort");

    function currentList() {
      const q = (qInput?.value || "").trim().toLowerCase();
      const cat = (catSelect?.value || "all").toLowerCase();
      const sort = (sortSelect?.value || "featured").toLowerCase();

      let list = products.slice();

      if (cat !== "all") {
        list = list.filter(p => (p.category || "").toLowerCase() === cat);
      }

      if (q) {
        list = list.filter(p => {
          const hay = (p.name + " " + (p.short || "") + " " + (p.tags || []).join(" ")).toLowerCase();
          return hay.includes(q);
        });
      }

      if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
      if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
      if (sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));
      // featured keeps original order

      return list;
    }

    function card(p) {
      const compare = p.compareAt && p.compareAt > p.price
        ? `<span class="price-compare">${money(p.compareAt)}</span>`
        : "";

      return `
        <article class="card product-card">
          <a class="product-link" href="../product/index.html?id=${encodeURIComponent(p.id)}" aria-label="${escapeHtml(p.name)}">
            <img class="product-img" src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" />
          </a>
          <div class="product-body">
            <div class="product-top">
              <h3 class="product-title">${escapeHtml(p.name)}</h3>
              <span class="badge">${escapeHtml(p.category || "Cupcakes")}</span>
            </div>
            <p class="product-desc">${escapeHtml(p.short || "")}</p>
            <div class="product-bottom">
              <div class="price">
                <span class="price-now">${money(p.price)}</span>
                ${compare}
              </div>
              <a class="btn btn-primary btn-sm" href="../product/index.html?id=${encodeURIComponent(p.id)}">View</a>
            </div>
          </div>
        </article>
      `;
    }

    function render() {
      const list = currentList();
      const rc = $("#resultCount");
      if (rc) rc.textContent = `${list.length} item${list.length === 1 ? "" : "s"}`;
      grid.innerHTML = list.map(card).join("");
    }

    qInput?.addEventListener("input", render);
    catSelect?.addEventListener("change", render);
    sortSelect?.addEventListener("change", render);

    render();
  }

  // ---------- Product page ----------
  function renderProduct() {
    const wrap = $("#productPage");
    if (!wrap) return;

    const products = window.CC_PRODUCTS || [];
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const product = products.find(p => p.id === id) || products[0];

    if (!product) {
      location.href = "../shop/index.html";
      return;
    }

    const variantOptions = (product.variants || []).map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("");
    wrap.innerHTML = `
      <div class="product-layout">
        <div class="product-media">
          <img src="${product.image}" alt="${escapeHtml(product.name)}" />
        </div>
        <div class="product-info">
          <div class="crumbs">
            <a href="../shop/index.html">Shop</a>
            <span aria-hidden="true">›</span>
            <span>${escapeHtml(product.name)}</span>
          </div>

          <h1>${escapeHtml(product.name)}</h1>
          <p class="muted">${escapeHtml(product.description || "")}</p>

          <div class="product-meta">
            <div class="price price-lg">
              <span class="price-now">${money(product.price)}</span>
              ${(product.compareAt && product.compareAt > product.price) ? `<span class="price-compare">${money(product.compareAt)}</span>` : ""}
            </div>
            <span class="badge">${escapeHtml(product.category || "Cupcakes")}</span>
          </div>

          <div class="form-row">
            <label for="variant">Variant</label>
            <select id="variant">${variantOptions}</select>
          </div>

          <div class="form-row">
            <label for="qty">Quantity</label>
            <input id="qty" type="number" min="1" max="99" value="1" />
          </div>

          <div class="product-actions">
            <button class="btn btn-primary" id="addBtn">Add to cart</button>
            <a class="btn btn-ghost" href="../cart/index.html">Go to cart</a>
          </div>

          <div class="notice">
            <strong>Same-day?</strong> For urgent orders, WhatsApp us before checkout to confirm availability.
          </div>
        </div>
      </div>
    `;

    $("#addBtn").addEventListener("click", () => {
      const variant = $("#variant").value || "";
      const qty = $("#qty").value || 1;
      upsertCartItem(product.id, variant, qty);
    });
  }

  // ---------- Cart page ----------
  function renderCart() {
    const listEl = $("#cartList");
    const summaryEl = $("#cartSummary");
    if (!listEl || !summaryEl) return;

    function line(item) {
      return `
        <div class="cart-item" data-key="${escapeHtml(item.key)}">
          <img class="cart-img" src="${item.image}" alt="${escapeHtml(item.name)}" loading="lazy" />
          <div class="cart-main">
            <div class="cart-title">
              <strong>${escapeHtml(item.name)}</strong>
              ${item.variant ? `<span class="muted">(${escapeHtml(item.variant)})</span>` : ""}
            </div>
            <div class="muted">${money(item.price)} each</div>
            <div class="cart-controls">
              <button class="btn btn-ghost btn-xs" data-dec>-</button>
              <input class="qty" type="number" min="1" max="99" value="${Number(item.qty) || 1}" />
              <button class="btn btn-ghost btn-xs" data-inc>+</button>
              <button class="btn btn-danger btn-xs" data-remove>Remove</button>
            </div>
          </div>
          <div class="cart-subtotal">${money((Number(item.price)||0) * (Number(item.qty)||0))}</div>
        </div>
      `;
    }

    function render() {
      const items = readCart();
      if (!items.length) {
        listEl.innerHTML = `
          <div class="empty">
            <h2>Your cart is empty</h2>
            <p class="muted">Browse cupcakes and add your favourites.</p>
            <a class="btn btn-primary" href="../shop/index.html">Go to shop</a>
          </div>
        `;
        summaryEl.innerHTML = "";
        return;
      }

      listEl.innerHTML = items.map(line).join("");

      const total = cartTotal(items);
      summaryEl.innerHTML = `
        <div class="card summary-card">
          <h3>Order summary</h3>
          <div class="summary-row"><span>Items</span><span>${cartCount(items)}</span></div>
          <div class="summary-row"><span>Subtotal</span><span>${money(total)}</span></div>
          <div class="summary-row muted"><span>Delivery</span><span>Calculated on WhatsApp</span></div>
          <hr />
          <div class="summary-row total"><span>Total</span><span>${money(total)}</span></div>

          <div class="summary-actions">
            <button class="btn btn-primary" id="waCheckout">Checkout via WhatsApp</button>
            <button class="btn btn-ghost" id="clearCart">Clear cart</button>
          </div>

          <p class="muted small">Checkout opens WhatsApp with your order details.</p>
        </div>
      `;

      $$(".cart-item", listEl).forEach(row => {
        const key = row.getAttribute("data-key");
        const input = $(".qty", row);
        const inc = $("[data-inc]", row);
        const dec = $("[data-dec]", row);
        const rm = $("[data-remove]", row);

        inc.addEventListener("click", () => { setCartQty(key, (Number(input.value)||1) + 1); render(); });
        dec.addEventListener("click", () => { setCartQty(key, (Number(input.value)||1) - 1); render(); });
        rm.addEventListener("click", () => { setCartQty(key, 0); render(); });

        input.addEventListener("change", () => {
          setCartQty(key, input.value);
          render();
        });
      });

      $("#clearCart").addEventListener("click", () => {
        clearCart();
        render();
        toast("Cart cleared");
      });

      $("#waCheckout").addEventListener("click", () => {
        const phone = "254746283504"; // TODO: change to your WhatsApp number (no +)
        const lines = items.map(it => `• ${it.name}${it.variant ? " ("+it.variant+")" : ""} ×${it.qty} = ${money((it.price*it.qty))}`);
        const msg = [
          "Hello Cupcake City 👋",
          "I’d like to order:",
          ...lines,
          "",
          `Subtotal: ${money(total)}`,
          "Name:",
          "Location:",
          "Preferred delivery/pickup time:"
        ].join("\n");

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      });
    }

    render();
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }



  

  document.addEventListener("DOMContentLoaded", () => {
    setupNav();
    syncCartBadges();
    renderShop();
    renderProduct();
    renderCart();
  });



  // ---------- Scroll Reveal Animations ----------
function setupScrollReveal() {
  const elements = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((el) => observer.observe(el));
}

// ---------- Smooth scroll ----------
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

// ---------- Parallax effect (hero image) ----------
function setupParallax() {
  const heroImg = document.querySelector(".hero-media img");
  if (!heroImg) return;

  window.addEventListener("scroll", () => {
    const offset = window.scrollY * 0.2;
    heroImg.style.transform = `translateY(${offset}px) scale(1.05)`;
  });
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  setupScrollReveal();
  setupSmoothScroll();
  setupParallax();
});

})();
