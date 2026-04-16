// ============================================================
//  BLING BLING BAKU — Main JS (Supabase version)
// ============================================================

let cart = JSON.parse(localStorage.getItem('bbb_cart') || '[]');
let productCache = []; // in-memory cache after first load
const PERSONALIZATION_DIAMOND_COLORS = [
  { name: 'White', hex: '#f4f4f4' },
  { name: 'Black', hex: '#24242c' },
  { name: 'Sky Blue', hex: '#74ccff' },
  { name: 'Emerald', hex: '#2ea57d' },
  { name: 'Lavender', hex: '#cdbdff' },
  { name: 'Pink', hex: '#f05f95' },
  { name: 'Ruby', hex: '#ff4d6d' },
  { name: 'Honey', hex: '#f4b338' },
  { name: 'Olive', hex: '#93a63f' },
  { name: 'Sapphire', hex: '#2f4fa6' }
];

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  initSupabase();
  updateCartBadge();
  renderCategories();
  await loadAndRenderHome();
  initScrollReveal();
});

// ============================================================
//  CATEGORIES
// ============================================================
function renderCategories() {
  const el = document.getElementById('catGrid');
  if (!el) return;
  el.innerHTML = getCategories().map(c => `
    <div class="cat-card" role="link" tabindex="0" onclick="window.location.href='shop/shop.html?cat=${c.key}'" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window.location.href='shop/shop.html?cat=${c.key}';}">
      <div class="cat-card__surface">
        <span class="cat-card__icon" aria-hidden="true"><i class="${c.icon}"></i></span>
        <span class="cat-card__name">${c.label}</span>
        <span class="cat-card__hint">View edit</span>
      </div>
    </div>`).join('');
}

// ============================================================
//  HOME — load products from Supabase
// ============================================================
async function loadAndRenderHome() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = loadingHTML();
  productCache = await getProducts();
  renderProductGrid(grid, productCache.slice(0, 8));
}

function renderProductGrid(grid, products) {
  grid.innerHTML = products.length
    ? products.map(p => productCard(p)).join('')
    : '<p class="no-products" style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-light)">No products yet. Check back soon! ✦</p>';
}

function loadingHTML() {
  return Array(4).fill(0).map(() => `
    <div class="product-card" style="pointer-events:none">
      <div class="product-img" style="background:var(--pink-pale);display:flex;align-items:center;justify-content:center;min-height:260px">
        <div style="width:40px;height:40px;border:3px solid var(--pink-light);border-top-color:var(--pink-deep);border-radius:50%;animation:spin 0.8s linear infinite"></div>
      </div>
      <div class="product-info">
        <div style="height:12px;background:var(--pink-pale);border-radius:6px;margin-bottom:8px"></div>
        <div style="height:18px;background:var(--pink-pale);border-radius:6px;margin-bottom:8px;width:70%"></div>
        <div style="height:14px;background:var(--pink-pale);border-radius:6px;width:40%"></div>
      </div>
    </div>`).join('');
}

function colorLabel(hex, fallback = 'Custom tone') {
  if (!hex) return fallback;
  const normalized = String(hex).toLowerCase();
  const map = {
    '#d4af37': 'Gold',
    '#c0c0c0': 'Silver',
    '#b76e79': 'Rose Gold',
    '#ffd700': 'Gold',
    '#f1c27d': 'Champagne',
    '#ffffff': 'White',
    '#000000': 'Black'
  };
  return map[normalized] || fallback;
}

// ============================================================
//  FILTER (home page buttons)
// ============================================================
async function filterProducts(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  if (!productCache.length) productCache = await getProducts();
  const filtered = cat === 'all' ? productCache : productCache.filter(p => p.category === cat);
  renderProductGrid(grid, filtered);
}

// ============================================================
//  SEARCH
// ============================================================
function toggleSearch() {
  const bar = document.getElementById('searchBar');
  bar.classList.toggle('open');
  if (bar.classList.contains('open')) document.getElementById('searchInput').focus();
}

async function searchProducts() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  const grid = document.getElementById('productsGrid') || document.getElementById('shopGrid');
  if (!grid) return;

  if (!q) {
    if (!productCache.length) productCache = await getProducts();
    renderProductGrid(grid, productCache.slice(0, 8));
    return;
  }

  if (!productCache.length) productCache = await getProducts();
  const results = productCache.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    (p.description && p.description.toLowerCase().includes(q))
  );

  grid.innerHTML = results.length
    ? results.map(p => productCard(p)).join('')
    : `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-light)">
        <i class="fas fa-search" style="font-size:2rem;display:block;margin-bottom:14px;color:var(--pink-light)"></i>
        <p>No results for <strong style="color:var(--text-mid)">"${q}"</strong></p>
       </div>`;
}

// ============================================================
//  PRODUCT MODAL
// ============================================================
async function openModal(id) {
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('productModal').classList.add('open');
  document.getElementById('modalBody').innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:400px;width:100%">
      <div style="width:40px;height:40px;border:3px solid var(--pink-light);border-top-color:var(--pink-deep);border-radius:50%;animation:spin 0.8s linear infinite"></div>
    </div>`;
  document.body.style.overflow = 'hidden';

  let p = productCache.find(x => String(x.id) === String(id));
  if (!p) p = await getProduct(id);
  if (!p) { closeModal(); return; }

  const images = Array.isArray(p.images) ? p.images : [];
  const colors = Array.isArray(p.colors) ? p.colors : [];
  const isOutOfStock = p.quantity <= 0;

  const mainImg = images.length
    ? `<img src="${images[0]}" alt="${p.name}" id="modalMainImgEl" style="max-width:100%;max-height:380px;object-fit:contain"/>`
    : `<div class="no-img"><i class="fas fa-gem"></i></div>`;

  const thumbs = images.length > 1
    ? images.map((img, i) => `
        <div class="modal-thumb ${i===0?'active':''}" onclick="switchModalImg(${i}, this, ${JSON.stringify(images).replace(/"/g,'&quot;')})">
          <img src="${img}" alt="" /></div>`).join('') : '';

  const chainColorBtns = colors.map((c, i) => `
    <button
      class="modal-color-btn ${i===0?'selected':''}"
      style="background:${c}"
      data-color="${c}"
      data-color-label="${colorLabel(c)}"
      onclick="selectModalColor(this)"
      title="${colorLabel(c)}"
      aria-label="${colorLabel(c)}"
    ></button>`).join('');

  const diamondColorBtns = PERSONALIZATION_DIAMOND_COLORS.map((c, i) => `
    <button
      class="modal-color-btn modal-color-btn--diamond ${i===0?'selected':''}"
      style="background:${c.hex}"
      data-diamond-color="${c.name}"
      data-diamond-hex="${c.hex}"
      onclick="selectDiamondColor(this)"
      title="${c.name}"
      aria-label="${c.name}"
    ></button>`).join('');

  const oldPrice = p.old_price ? `<span class="old-price" style="text-decoration:line-through;color:var(--text-light);font-size:1rem;margin-right:8px">${p.old_price} AZN</span>` : '';

  // Store product data on modal for cart use
  document.getElementById('productModal').dataset.product = JSON.stringify({
    id: p.id,
    name: p.name,
    price: p.price,
    image: images[0] || null,
    quantity: p.quantity
  });

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
      <div class="modal-personalize">
        <div class="modal-personalize-note">
          <i class="fas fa-stars" aria-hidden="true"></i>
          <span>Personalized piece prepared specially for you</span>
        </div>
        <div class="modal-engraving">
          <h5>Engraving (10 characters max)</h5>
          <input
            id="modalEngraving"
            class="modal-engraving-input"
            type="text"
            maxlength="10"
            placeholder="AMAYA"
            oninput="updateEngravingCounter()"
          />
          <p class="modal-engraving-help">Letters, numbers, and emojis are supported.</p>
          <span class="modal-engraving-counter" id="modalEngravingCounter">0 / 10</span>
        </div>
        ${chainColorBtns ? `<div class="modal-colors"><h5>Chain Color</h5><div class="modal-color-opts">${chainColorBtns}</div></div>` : ''}
        <div class="modal-colors">
          <h5>Diamond Color</h5>
          <div class="modal-color-opts">${diamondColorBtns}</div>
        </div>
      </div>
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
        <button class="btn btn-outline" onclick="inquireProductFromModal()">
          <i class="fab fa-whatsapp"></i> Ask on WhatsApp
        </button>
      </div>
    </div>`;
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('productModal').classList.remove('open');
  document.body.style.overflow = '';
}

function switchModalImg(i, thumb, images) {
  const el = document.getElementById('modalMainImgEl');
  if (el && images[i]) el.src = images[i];
  document.querySelectorAll('.modal-thumb').forEach((t, idx) => t.classList.toggle('active', idx === i));
}

function selectModalColor(btn) {
  document.querySelectorAll('.modal-color-btn:not(.modal-color-btn--diamond)').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function selectDiamondColor(btn) {
  document.querySelectorAll('.modal-color-btn--diamond').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function updateEngravingCounter() {
  const input = document.getElementById('modalEngraving');
  const counter = document.getElementById('modalEngravingCounter');
  if (!input || !counter) return;
  // Keep engraving style consistent and premium-looking.
  input.value = (input.value || '').toUpperCase();
  const val = input.value || '';
  counter.textContent = `${val.length} / 10`;
}

function getSelectedModalPersonalization() {
  const selectedColor = document.querySelector('.modal-color-btn.selected:not(.modal-color-btn--diamond)');
  const selectedDiamond = document.querySelector('.modal-color-btn--diamond.selected');
  const engravingInput = document.getElementById('modalEngraving');
  return {
    color: selectedColor ? selectedColor.dataset.color || selectedColor.style.background : null,
    colorLabel: selectedColor ? selectedColor.dataset.colorLabel || colorLabel(selectedColor.dataset.color || selectedColor.style.background) : null,
    diamond: selectedDiamond ? selectedDiamond.dataset.diamondColor || null : null,
    diamondHex: selectedDiamond ? selectedDiamond.dataset.diamondHex || null : null,
    engraving: (engravingInput?.value || '').trim().toUpperCase()
  };
}

let _modalQty = 1;
function changeModalQty(delta) {
  const modal = document.getElementById('productModal');
  const p = modal.dataset.product ? JSON.parse(modal.dataset.product) : null;
  const max = p ? p.quantity : 99;
  _modalQty = Math.max(1, Math.min(max, _modalQty + delta));
  const el = document.getElementById('modalQtyVal');
  if (el) el.textContent = _modalQty;
}

function addToCartFromModal() {
  const modal = document.getElementById('productModal');
  const p = modal.dataset.product ? JSON.parse(modal.dataset.product) : null;
  if (!p) return;
  const personalization = getSelectedModalPersonalization();
  addToCartItem(p.id, p.name, p.price, p.image, _modalQty, {
    color: personalization.color,
    colorLabel: personalization.colorLabel,
    diamond: personalization.diamond,
    diamondHex: personalization.diamondHex,
    engraving: personalization.engraving
  });
  _modalQty = 1;
  closeModal();
}

// ============================================================
//  CART (still localStorage — cart is per-browser which is correct)
// ============================================================
function addToCart(id) {
  const p = productCache.find(x => String(x.id) === String(id));
  if (!p) return;
  const images = Array.isArray(p.images) ? p.images : [];
  addToCartItem(p.id, p.name, p.price, images[0] || null, 1, {
    color: null,
    colorLabel: null,
    diamond: null,
    diamondHex: null,
    engraving: ''
  });
}

function addToCartItem(id, name, price, image, qty, personalization = {}) {
  const normalizedPersonalization = {
    color: personalization.color || null,
    colorLabel: personalization.colorLabel || null,
    diamond: personalization.diamond || null,
    diamondHex: personalization.diamondHex || null,
    engraving: personalization.engraving || ''
  };
  const existing = cart.find(
    i =>
      String(i.id) === String(id) &&
      i.color === normalizedPersonalization.color &&
      i.diamond === normalizedPersonalization.diamond &&
      i.engraving === normalizedPersonalization.engraving
  );
  if (existing) { existing.qty += qty; }
  else {
    cart.push({
      id: String(id),
      name,
      price,
      qty,
      color: normalizedPersonalization.color,
      colorLabel: normalizedPersonalization.colorLabel,
      diamond: normalizedPersonalization.diamond,
      diamondHex: normalizedPersonalization.diamondHex,
      engraving: normalizedPersonalization.engraving,
      image
    });
  }
  localStorage.setItem('bbb_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCartItems();
  openCartDrawer();
}

function updateCartBadge() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('#cartCount').forEach(el => el.textContent = count);
}

function renderCartItems() {
  const el = document.getElementById('cartItems');
  if (!el) return;
  if (!cart.length) {
    el.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>Your bag is empty</p></div>`;
  } else {
    el.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-img">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" />` : `<i class="fas fa-gem" style="color:var(--pink-light);font-size:1.5rem"></i>`}
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          ${(item.color || item.diamond || item.engraving) ? `
            <div class="cart-item-personalization">
              ${item.engraving ? `<span class="cart-personal-chip">Engraving: ${item.engraving}</span>` : ''}
              ${item.color ? `<span class="cart-personal-chip"><span class="cart-personal-dot" style="background:${item.color}"></span>Chain: ${item.colorLabel || 'Custom'}</span>` : ''}
              ${item.diamond ? `<span class="cart-personal-chip"><span class="cart-personal-dot" style="background:${item.diamondHex || '#f4f4f4'}"></span>Diamond: ${item.diamond}</span>` : ''}
            </div>
          ` : ''}
          <div class="cart-item-price">${(item.price * item.qty).toFixed(2)} AZN</div>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="updateCartQty(${idx},-1)">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="updateCartQty(${idx},1)">+</button>
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
  localStorage.setItem('bbb_cart', JSON.stringify(cart));
  updateCartBadge(); renderCartItems();
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  localStorage.setItem('bbb_cart', JSON.stringify(cart));
  updateCartBadge(); renderCartItems();
}

function toggleCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer.classList.contains('open')) {
    drawer.classList.remove('open'); overlay.classList.remove('open');
  } else { openCartDrawer(); }
}

function openCartDrawer() {
  renderCartItems();
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
}

function checkoutWhatsApp() {
  if (!cart.length) return;
  let msg = `Hello! I'd like to order from Bling Bling Baku:%0A%0A`;
  cart.forEach(item => {
    msg += `▪ ${item.name}`;
    if (item.engraving) msg += ` (engraving: ${item.engraving})`;
    if (item.colorLabel) msg += ` (chain: ${item.colorLabel})`;
    if (item.diamond) msg += ` (diamond: ${item.diamond})`;
    msg += ` × ${item.qty} = ${(item.price * item.qty).toFixed(2)} AZN%0A`;
  });
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  msg += `%0ATotal: ${total.toFixed(2)} AZN%0A%0APlease confirm availability. Thank you! 🌸`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
}

function inquireProduct(id, name, price) {
  const msg = `Hello! I'm interested in: *${name}* — ${price} AZN. Is it available? 🌸`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

function inquireProductFromModal() {
  const modal = document.getElementById('productModal');
  const p = modal.dataset.product ? JSON.parse(modal.dataset.product) : null;
  if (!p) return;
  const personalization = getSelectedModalPersonalization();
  let msg = `Hello! I want to order this item:%0A*${p.name}* — ${p.price} AZN`;
  if (personalization.engraving) msg += `%0AName/engraving: ${personalization.engraving}`;
  if (personalization.colorLabel) msg += `%0AChain color: ${personalization.colorLabel}`;
  if (personalization.diamond) msg += `%0ADiamond color: ${personalization.diamond}`;
  msg += `%0A%0AIs this personalized version available? 🌸`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
}

// ============================================================
//  CONTACT FORM
// ============================================================
function submitInquiry(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.querySelector('[name="name"]')?.value?.trim() || '';
  const phone = form.querySelector('[name="phone"]')?.value?.trim() || '';
  const msg = form.querySelector('[name="message"]')?.value?.trim() || '';
  const text = `Hello Bling Bling Baku,\n\nName: ${name}\nPhone: ${phone}\n\n${msg}`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
}

// ============================================================
//  UI HELPERS
// ============================================================
function toggleMenu() { document.getElementById('navLinks')?.classList.toggle('open'); }

function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.hero, .section-header, .cat-card, .product-card, .promo-banner, .about-grid, .contact-grid, .shop-sidebar, .shop-main, .footer-grid, .insta-strip, .page-hero.small'
  );
  if (!targets.length) return;

  targets.forEach(el => el.classList.add('reveal-on-scroll'));

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
}

window.addEventListener('scroll', () => {
  const h = document.getElementById('header');
  if (h) h.style.boxShadow = window.scrollY > 40 ? '0 2px 20px rgba(0,0,0,0.08)' : '';
});

// Spinner CSS
const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(spinStyle);
