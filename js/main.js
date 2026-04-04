// ============================================================
// BLING BLING BAKU — Main JS
// ============================================================

const WA_NUMBER = '994702003335';
let cart = JSON.parse(localStorage.getItem('bbb_cart') || '[]');
let selectedColor = null;
let modalQty = 1;
let currentModalProduct = null;

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  renderCategories();
  renderHomeProducts();
});

// ---- CATEGORIES ----
function renderCategories() {
  const el = document.getElementById('catGrid');
  if (!el) return;
  const cats = getCategories();
  el.innerHTML = cats.map(c => `
    <div class="cat-card" onclick="window.location.href='shop/shop.html?cat=${c.key}'">
      <div class="cat-icon"><i class="${c.icon}"></i></div>
      <p>${c.label}</p>
    </div>`).join('');
}

// ---- HOME PRODUCTS (show latest 8) ----
function renderHomeProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  const products = getProducts().filter(p => p.active !== false).slice(0, 8);
  grid.innerHTML = products.map(p => productCard(p)).join('');
}

// ---- FILTER (home page) ----
function filterProducts(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  const all = getProducts().filter(p => p.active !== false);
  const filtered = cat === 'all' ? all : all.filter(p => p.category === cat);
  grid.innerHTML = filtered.map(p => productCard(p)).join('');
}

// ---- SEARCH ----
function toggleSearch() {
  const bar = document.getElementById('searchBar');
  bar.classList.toggle('open');
  if (bar.classList.contains('open')) document.getElementById('searchInput').focus();
}

function searchProducts() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  if (!q) return;
  const results = getProducts().filter(p => p.active !== false && (
    p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  ));
  const grid = document.getElementById('productsGrid') || document.getElementById('shopGrid');
  if (grid) grid.innerHTML = results.length
    ? results.map(p => productCard(p)).join('')
    : '<p class="no-products">No results found.</p>';
}

// ---- PRODUCT MODAL ----
function openModal(id) {
  const p = getProducts().find(x => x.id === id);
  if (!p) return;
  currentModalProduct = p;
  selectedColor = p.colors && p.colors.length ? p.colors[0] : null;
  modalQty = 1;

  const isOutOfStock = p.quantity <= 0;
  const mainImg = p.images && p.images.length
    ? `<img src="${p.images[0]}" alt="${p.name}" id="modalMainImgEl" />`
    : `<div class="no-img"><i class="fas fa-gem"></i></div>`;

  const thumbs = p.images && p.images.length > 1
    ? p.images.map((img, i) => `
        <div class="modal-thumb ${i===0?'active':''}" onclick="switchModalImg(${i})">
          <img src="${img}" alt="" />
        </div>`).join('') : '';

  const colorBtns = p.colors && p.colors.length
    ? p.colors.map((c,i) => `
        <button class="modal-color-btn ${i===0?'selected':''}" style="background:${c}"
          onclick="selectColor('${c}', this)" title="${c}"></button>`).join('') : '';

  const oldPrice = p.oldPrice ? `<span class="old-price" style="text-decoration:line-through;color:var(--text-light);font-size:1rem;margin-right:8px">${p.oldPrice} AZN</span>` : '';

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-gallery">
      <div class="modal-main-img">${mainImg}</div>
      ${thumbs ? `<div class="modal-thumbs">${thumbs}</div>` : ''}
    </div>
    <div class="modal-info">
      <div class="modal-cat">${p.category}</div>
      <div class="modal-name">${p.name}</div>
      <div class="modal-price">${oldPrice}${p.price} AZN</div>
      <p class="modal-desc">${p.description || ''}</p>
      ${colorBtns ? `<div class="modal-colors"><h5>Color</h5><div class="modal-color-opts">${colorBtns}</div></div>` : ''}
      <div class="modal-qty">
        <h5>Quantity</h5>
        <div class="modal-qty-controls">
          <button class="qty-btn" onclick="changeModalQty(-1)">−</button>
          <span class="modal-qty-val" id="modalQtyVal">1</span>
          <button class="qty-btn" onclick="changeModalQty(1)">+</button>
        </div>
      </div>
      <p class="modal-stock ${isOutOfStock?'out':'in'}">
        <i class="fas fa-circle" style="font-size:0.5rem;margin-right:5px"></i>
        ${isOutOfStock ? 'Out of stock' : `In stock (${p.quantity} left)`}
      </p>
      <div class="modal-actions">
        ${!isOutOfStock ? `<button class="btn btn-primary" onclick="addToCartFromModal()"><i class="fas fa-shopping-bag"></i> Add to Bag</button>` : ''}
        <button class="btn btn-outline" onclick="inquireProduct(${p.id})" style="border-color:var(--pink)">
          <i class="fab fa-whatsapp"></i> Ask on WhatsApp
        </button>
      </div>
    </div>`;

  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('productModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('productModal').classList.remove('open');
  document.body.style.overflow = '';
}

function switchModalImg(i) {
  if (!currentModalProduct || !currentModalProduct.images) return;
  const el = document.getElementById('modalMainImgEl');
  if (el) el.src = currentModalProduct.images[i];
  document.querySelectorAll('.modal-thumb').forEach((t, idx) => t.classList.toggle('active', idx === i));
}

function selectColor(color, btn) {
  selectedColor = color;
  document.querySelectorAll('.modal-color-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function changeModalQty(delta) {
  if (!currentModalProduct) return;
  modalQty = Math.max(1, Math.min(currentModalProduct.quantity, modalQty + delta));
  document.getElementById('modalQtyVal').textContent = modalQty;
}

function addToCartFromModal() {
  if (!currentModalProduct) return;
  addToCartItem(currentModalProduct, modalQty, selectedColor);
  closeModal();
}

// ---- CART ----
function addToCart(id) {
  const p = getProducts().find(x => x.id === id);
  if (!p) return;
  addToCartItem(p, 1, null);
}

function addToCartItem(p, qty, color) {
  const existing = cart.find(i => i.id === p.id && i.color === color);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, p.quantity);
  } else {
    cart.push({ id: p.id, name: p.name, price: p.price, qty, color, image: p.images && p.images.length ? p.images[0] : null });
  }
  saveCart();
  updateCartUI();
  openCart();
}

function saveCart() {
  localStorage.setItem('bbb_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('#cartCount').forEach(el => el.textContent = count);

  const itemsEl = document.getElementById('cartItems');
  if (!itemsEl) return;

  if (!cart.length) {
    itemsEl.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>Your bag is empty</p></div>`;
  } else {
    itemsEl.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-img">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" />` : `<i class="fas fa-gem" style="color:var(--pink-light);font-size:1.5rem"></i>`}
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          ${item.color ? `<div style="display:flex;align-items:center;gap:6px;margin:4px 0"><span style="width:12px;height:12px;border-radius:50%;background:${item.color};display:inline-block;border:1px solid #eee"></span></div>` : ''}
          <div class="cart-item-price">${item.price * item.qty} AZN</div>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="updateCartQty(${idx}, -1)">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="updateCartQty(${idx}, 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${idx})"><i class="fas fa-trash-alt"></i></button>
      </div>`).join('');
  }
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = total.toFixed(2) + ' AZN';
}

function updateCartQty(idx, delta) {
  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  saveCart(); updateCartUI();
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  saveCart(); updateCartUI();
}

function toggleCart() {
  document.getElementById('cartDrawer').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
}
function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
}

function checkoutWhatsApp() {
  if (!cart.length) return;
  let msg = `Hello! I'd like to order from Bling Bling Baku:%0A%0A`;
  cart.forEach(item => {
    msg += `▪ ${item.name}`;
    if (item.color) msg += ` (color: ${item.color})`;
    msg += ` × ${item.qty} = ${item.price * item.qty} AZN%0A`;
  });
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  msg += `%0ATotal: ${total.toFixed(2)} AZN%0A%0APlease confirm availability. Thank you! 🌸`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
}

function inquireProduct(id) {
  const p = getProducts().find(x => x.id === id);
  if (!p) return;
  const msg = `Hello! I'm interested in: *${p.name}* — ${p.price} AZN. Is it available? 🌸`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ---- CONTACT FORM ----
function submitInquiry(e) {
  e.preventDefault();
  const inputs = e.target.querySelectorAll('input, textarea');
  const name = inputs[0].value;
  const phone = inputs[1].value;
  const msg = inputs[2].value;
  const wa = `Hello from ${name} (${phone}):%0A${encodeURIComponent(msg)}`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${wa}`, '_blank');
}

// ---- MENU TOGGLE (mobile) ----
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ---- SCROLL EFFECTS ----
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (header) header.style.boxShadow = window.scrollY > 40 ? '0 2px 20px rgba(0,0,0,0.08)' : '';
});
