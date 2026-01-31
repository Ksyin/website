/* Cupcake City - production-ready static store (no build tools)
   - Data: PRODUCTS array (each has image)
   - Pages:
      /shop/   renders listing
      /product/?id=slug  renders single
      /cart/   renders cart
*/

const WHATSAPP_PHONE = "254700000000"; // TODO: replace
const CURRENCY = "KES";

const PRODUCTS = [
  {
    id: "choco-fudge-4",
    name: "Chocolate Fudge Cupcakes (4 Pack)",
    category: "Cupcakes",
    price: 720,
    image: "https://images.unsplash.com/photo-1599785209707-28d08b7d35a3?auto=format&fit=crop&w=1200&q=80",
    description: "Rich cocoa cupcakes topped with silky chocolate fudge. Perfect for quick treats and small celebrations.",
    tags: ["Best Seller", "Chocolate"]
  },
  {
    id: "vanilla-velvet-6",
    name: "Vanilla Velvet Cupcakes (6 Pack)",
    category: "Cupcakes",
    price: 1050,
    image: "https://images.unsplash.com/photo-1589307004391-70fcdcf8a3c7?auto=format&fit=crop&w=1200&q=80",
    description: "Soft vanilla sponge with a smooth vanilla bean frosting. Clean, classic, and always a crowd favorite.",
    tags: ["Classic", "Vanilla"]
  },
  {
    id: "red-velvet-6",
    name: "Red Velvet Cupcakes (6 Pack)",
    category: "Cupcakes",
    price: 1200,
    image: "https://images.unsplash.com/photo-1528839032308-6ea2b0b23d0a?auto=format&fit=crop&w=1200&q=80",
    description: "A velvet-soft bite with a gentle cocoa note and cream-cheese style frosting. Elegant and indulgent.",
    tags: ["Premium", "Velvet"]
  },
  {
    id: "lemon-zest-4",
    name: "Lemon Zest Cupcakes (4 Pack)",
    category: "Cupcakes",
    price: 780,
    image: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=1200&q=80",
    description: "Bright lemon cupcakes with a zesty glaze. Light, fresh, and perfect after meals.",
    tags: ["Fresh", "Citrus"]
  },
  {
    id: "caramel-crunch-4",
    name: "Salted Caramel Crunch (4 Pack)",
    category: "Cupcakes",
    price: 850,
    image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=1200&q=80",
    description: "Caramel frosting, crunchy topping, and a pinch of salt to balance the sweetness. Addictive!",
    tags: ["Sweet & Salty", "Crunch"]
  },
  {
    id: "kids-sprinkle-6",
    name: "Sprinkle Party Cupcakes (6 Pack)",
    category: "Kids",
    price: 1100,
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1200&q=80",
    description: "Colorful sprinkles, fun frosting, and soft sponge—built for birthdays and happy moments.",
    tags: ["Party", "Kids"]
  },
  {
    id: "mini-mix-12",
    name: "Mini Cupcake Mix (12 Pack)",
    category: "Mini",
    price: 1350,
    image: "https://images.unsplash.com/photo-1541976844346-f18aeac57b06?auto=format&fit=crop&w=1200&q=80",
    description: "A variety pack of mini cupcakes. Great for office snacks and tasting sessions.",
    tags: ["Variety", "Mini"]
  },
  {
    id: "gluten-free-4",
    name: "Gluten-Free Cupcakes (4 Pack)",
    category: "Special",
    price: 950,
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80",
    description: "Soft, satisfying cupcakes made with gluten-free ingredients. Balanced texture and rich flavor.",
    tags: ["Special", "Gluten-Free"]
  }
];

// -------------------- Utilities --------------------
function money(n){
  return `${CURRENCY} ${Number(n).toLocaleString()}`;
}
function $(sel){ return document.querySelector(sel); }
function getParam(name){
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}
function safeText(s){
  return String(s ?? "").replace(/[<>]/g, "");
}

function loadCart(){
  try{
    return JSON.parse(localStorage.getItem("cc_cart") || "[]");
  }catch(e){ return []; }
}
function saveCart(cart){
  localStorage.setItem("cc_cart", JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount(){
  const cart = loadCart();
  const count = cart.reduce((a,i)=>a + (i.qty || 1), 0);
  document.querySelectorAll("[data-cart-count]").forEach(el=>el.textContent = String(count));
}

function addToCart(productId, qty=1){
  const product = PRODUCTS.find(p=>p.id===productId);
  if(!product) return;
  const cart = loadCart();
  const existing = cart.find(i=>i.id===productId);
  if(existing) existing.qty = (existing.qty || 1) + qty;
  else cart.push({ id: productId, qty: qty });
  saveCart(cart);
  toast("Added to cart 🛒");
}

function setQty(productId, qty){
  const cart = loadCart();
  const item = cart.find(i=>i.id===productId);
  if(!item) return;
  item.qty = Math.max(1, qty|0);
  saveCart(cart);
  renderCart();
}

function removeFromCart(productId){
  const cart = loadCart().filter(i=>i.id!==productId);
  saveCart(cart);
  renderCart();
}

function clearCart(){
  saveCart([]);
  renderCart();
}

function toast(msg){
  const t = document.createElement("div");
  t.style.position="fixed";
  t.style.left="50%";
  t.style.bottom="22px";
  t.style.transform="translateX(-50%)";
  t.style.background="rgba(31,41,55,.92)";
  t.style.color="white";
  t.style.padding="12px 14px";
  t.style.borderRadius="14px";
  t.style.fontWeight="800";
  t.style.zIndex="9999";
  t.style.boxShadow="0 10px 25px rgba(0,0,0,.18)";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 1400);
}

function productCard(p){
  const badge = (p.tags && p.tags.length) ? `<span class="badge">${safeText(p.tags[0])}</span>` : "";
  return `
    <article class="card product">
      <div class="p-img"><img src="${p.image}" alt="${safeText(p.name)}" loading="lazy"></div>
      <div class="p-body">
        <h3 class="p-title">${safeText(p.name)}</h3>
        <div class="p-meta">
          <span class="price">${money(p.price)}</span>
          ${badge}
        </div>
      </div>
      <div class="p-actions">
        <a class="btn btn-small btn-outline" href="/product/?id=${encodeURIComponent(p.id)}">View</a>
        <button class="btn btn-small btn-solid" data-add="${p.id}">Add</button>
      </div>
    </article>
  `;
}

// -------------------- Navbar --------------------
function setupMobileMenu(){
  const btn = $("#mobileToggle");
  const menu = $("#mobileMenu");
  if(!btn || !menu) return;
  btn.addEventListener("click", ()=>{
    menu.classList.toggle("show");
  });
}

// -------------------- Home --------------------
function renderHomeFeatured(){
  const host = $("#featuredGrid");
  if(!host) return;
  const featured = PRODUCTS.slice(0, 6);
  host.innerHTML = featured.map(productCard).join("");
  host.querySelectorAll("[data-add]").forEach(b=>{
    b.addEventListener("click", ()=> addToCart(b.getAttribute("data-add"), 1));
  });
}

// -------------------- Shop --------------------
function renderShop(){
  const host = $("#shopGrid");
  if(!host) return;

  const q = ($("#searchInput")?.value || "").toLowerCase().trim();
  const cat = $("#categorySelect")?.value || "All";
  const sort = $("#sortSelect")?.value || "featured";

  let list = [...PRODUCTS];

  if(q){
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description||"").toLowerCase().includes(q) ||
      (p.tags||[]).join(" ").toLowerCase().includes(q)
    );
  }
  if(cat !== "All"){
    list = list.filter(p => p.category === cat);
  }

  if(sort === "price_asc") list.sort((a,b)=>a.price-b.price);
  if(sort === "price_desc") list.sort((a,b)=>b.price-a.price);
  if(sort === "name_asc") list.sort((a,b)=>a.name.localeCompare(b.name));

  host.innerHTML = list.map(productCard).join("") || `<div class="notice">No products found. Try another search.</div>`;
  host.querySelectorAll("[data-add]").forEach(b=>{
    b.addEventListener("click", ()=> addToCart(b.getAttribute("data-add"), 1));
  });
}

function initShopControls(){
  const s = $("#searchInput");
  const c = $("#categorySelect");
  const o = $("#sortSelect");
  [s,c,o].forEach(el=>{
    if(!el) return;
    el.addEventListener("input", renderShop);
    el.addEventListener("change", renderShop);
  });
  renderShop();
}

// -------------------- Product Page --------------------
function renderProduct(){
  const host = $("#productRoot");
  if(!host) return;
  const id = getParam("id") || PRODUCTS[0].id;
  const p = PRODUCTS.find(x=>x.id===id) || PRODUCTS[0];

  host.innerHTML = `
    <div class="product-page">
      <div class="media"><img src="${p.image}" alt="${safeText(p.name)}"></div>
      <div class="info">
        <div class="badge">${safeText(p.category)}</div>
        <h2 style="margin:10px 0 6px;">${safeText(p.name)}</h2>
        <p class="muted" style="margin:0 0 10px; line-height:1.7;">${safeText(p.description)}</p>
        <div class="hr"></div>
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
          <div style="font-weight:900; font-size:18px;">${money(p.price)}</div>
          <div class="muted" style="font-size:13px;">Freshly baked · Nairobi</div>
        </div>
        <div class="hr"></div>
        <div class="qty" style="margin-bottom:12px;">
          <button id="decQty" aria-label="decrease quantity">−</button>
          <input id="qtyInput" value="1" inputmode="numeric" aria-label="quantity">
          <button id="incQty" aria-label="increase quantity">+</button>
        </div>
        <button class="btn btn-primary" id="addToCartBtn" style="width:100%;">Add to Cart</button>
        <div class="notice" style="margin-top:12px;">
          Tip: You can checkout via WhatsApp on the Cart page.
        </div>
      </div>
    </div>
  `;

  const qtyInput = $("#qtyInput");
  const inc = $("#incQty");
  const dec = $("#decQty");
  const addBtn = $("#addToCartBtn");

  const clampQty = ()=>{
    let v = parseInt(qtyInput.value || "1", 10);
    if(Number.isNaN(v) || v < 1) v = 1;
    if(v > 99) v = 99;
    qtyInput.value = String(v);
    return v;
  };

  inc?.addEventListener("click", ()=>{ qtyInput.value = String(clampQty()+1); clampQty(); });
  dec?.addEventListener("click", ()=>{ qtyInput.value = String(clampQty()-1); clampQty(); });
  qtyInput?.addEventListener("input", clampQty);
  addBtn?.addEventListener("click", ()=> addToCart(p.id, clampQty()));
}

// -------------------- Cart --------------------
function renderCart(){
  const host = $("#cartList");
  const totalEl = $("#cartTotal");
  const emptyEl = $("#cartEmpty");

  if(!host || !totalEl || !emptyEl) return;

  const cart = loadCart();
  if(cart.length === 0){
    host.innerHTML = "";
    totalEl.textContent = money(0);
    emptyEl.style.display = "block";
    return;
  }
  emptyEl.style.display = "none";

  let total = 0;
  host.innerHTML = cart.map(item=>{
    const p = PRODUCTS.find(x=>x.id===item.id);
    if(!p) return "";
    const qty = item.qty || 1;
    const line = p.price * qty;
    total += line;

    return `
      <div class="card cart-item">
        <img src="${p.image}" alt="${safeText(p.name)}">
        <div>
          <h4>${safeText(p.name)}</h4>
          <div class="muted">${money(p.price)} each · <span style="font-weight:900;color:#c02654">${money(line)}</span></div>
          <div class="cart-actions" style="margin-top:10px;">
            <button class="icon-btn" data-dec="${p.id}">−</button>
            <span style="font-weight:900; min-width: 22px; text-align:center;">${qty}</span>
            <button class="icon-btn" data-inc="${p.id}">+</button>
            <button class="icon-btn" data-rm="${p.id}">Remove</button>
          </div>
        </div>
        <div style="text-align:right; font-weight:900;">${money(line)}</div>
      </div>
    `;
  }).join("");

  totalEl.textContent = money(total);

  host.querySelectorAll("[data-inc]").forEach(b=>{
    b.addEventListener("click", ()=> setQty(b.getAttribute("data-inc"), (loadCart().find(i=>i.id===b.getAttribute("data-inc"))?.qty || 1) + 1));
  });
  host.querySelectorAll("[data-dec]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const id = b.getAttribute("data-dec");
      const current = loadCart().find(i=>i.id===id)?.qty || 1;
      setQty(id, Math.max(1, current - 1));
    });
  });
  host.querySelectorAll("[data-rm]").forEach(b=>{
    b.addEventListener("click", ()=> removeFromCart(b.getAttribute("data-rm")));
  });
}

function checkoutWhatsApp(){
  const cart = loadCart();
  if(cart.length === 0){
    toast("Your cart is empty");
    return;
  }
  const lines = [];
  let total = 0;
  cart.forEach(item=>{
    const p = PRODUCTS.find(x=>x.id===item.id);
    if(!p) return;
    const qty = item.qty || 1;
    const line = p.price * qty;
    total += line;
    lines.push(`${qty} x ${p.name} — ${CURRENCY} ${line.toLocaleString()}`);
  });

  const message =
    `Hello Cupcake City!%0A%0A` +
    `I'd like to order:%0A` +
    lines.map(l=>`• ${encodeURIComponent(l)}`).join("%0A") +
    `%0A%0ATotal: ${encodeURIComponent(money(total))}%0A` +
    `Delivery location: (type here)%0A` +
    `Preferred time: (type here)%0A`;

  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${message}`, "_blank");
}

// -------------------- Boot --------------------
document.addEventListener("DOMContentLoaded", ()=>{
  updateCartCount();
  setupMobileMenu();

  renderHomeFeatured();
  initShopControls();
  renderProduct();
  renderCart();

  const checkoutBtn = $("#checkoutBtn");
  checkoutBtn?.addEventListener("click", checkoutWhatsApp);

  const clearBtn = $("#clearCartBtn");
  clearBtn?.addEventListener("click", clearCart);
});