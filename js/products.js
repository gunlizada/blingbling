// ============================================================
// BLING BLING BAKU — Products Database
// Add products here OR use the Admin Panel
// ============================================================

function getProducts() {
  const stored = localStorage.getItem('bbb_products');
  if (stored) return JSON.parse(stored);
  // Default demo products
  const defaults = [
    {
      id: 1, name: "Rose Gold Statement Necklace", category: "necklaces",
      price: 89, oldPrice: 120, description: "Delicate rose gold plated chain with a sparkling pendant. Perfect for any occasion.",
      images: [], colors: ["#FFD700","#C0C0C0","#B8860B"], quantity: 15,
      badge: "New", active: true
    },
    {
      id: 2, name: "Crystal Drop Earrings", category: "earrings",
      price: 45, oldPrice: null, description: "Elegant crystal drops that catch the light beautifully. Lightweight and comfortable for all-day wear.",
      images: [], colors: ["#E8879E","#9B59B6","#3498DB"], quantity: 20,
      badge: "Bestseller", active: true
    },
    {
      id: 3, name: "Pearl Bead Bracelet", category: "bracelets",
      price: 62, oldPrice: null, description: "Timeless freshwater pearl bracelet with a gold clasp. A classic piece for every jewelry collection.",
      images: [], colors: ["#F5F5F5","#FFC0CB","#E8879E"], quantity: 8,
      badge: null, active: true
    },
    {
      id: 4, name: "Stacking Ring Set", category: "rings",
      price: 55, oldPrice: 75, description: "Set of 3 delicate rings — perfect for mixing and matching. Available in gold and silver tones.",
      images: [], colors: ["#FFD700","#C0C0C0"], quantity: 12,
      badge: "Sale", active: true
    },
    {
      id: 5, name: "Mini Leather Crossbody", category: "bags",
      price: 145, oldPrice: null, description: "Compact and stylish crossbody bag in premium faux leather. Features gold-tone hardware.",
      images: [], colors: ["#8B4513","#F5F5F5","#2C3E50","#E8879E"], quantity: 5,
      badge: "New", active: true
    },
    {
      id: 6, name: "Butterfly Hair Clips Set", category: "accessories",
      price: 28, oldPrice: null, description: "Set of 6 decorative butterfly clips in pastel tones. Trendy and playful.",
      images: [], colors: ["#E8879E","#9B59B6","#3498DB","#F39C12"], quantity: 30,
      badge: null, active: true
    },
    {
      id: 7, name: "Gold Chain Anklet", category: "bracelets",
      price: 38, oldPrice: null, description: "Dainty 18k gold-plated anklet with a delicate charm. Adjustable for a perfect fit.",
      images: [], colors: ["#FFD700"], quantity: 18,
      badge: "New", active: true
    },
    {
      id: 8, name: "Pearl Cluster Ring", category: "rings",
      price: 72, oldPrice: 95, description: "Statement ring with a cluster of freshwater pearls set in gold tone. Elegant and bold.",
      images: [], colors: ["#FFD700","#C0C0C0"], quantity: 7,
      badge: "Sale", active: true
    }
  ];
  localStorage.setItem('bbb_products', JSON.stringify(defaults));
  return defaults;
}

function saveProducts(products) {
  localStorage.setItem('bbb_products', JSON.stringify(products));
}

function getCategories() {
  return [
    { key: 'necklaces', label: 'Necklaces', icon: 'fas fa-gem' },
    { key: 'earrings',  label: 'Earrings',  icon: 'fas fa-circle' },
    { key: 'rings',     label: 'Rings',     icon: 'fas fa-ring' },
    { key: 'bracelets', label: 'Bracelets', icon: 'fas fa-link' },
    { key: 'bags',      label: 'Bags',      icon: 'fas fa-shopping-bag' },
    { key: 'accessories', label: 'Accessories', icon: 'fas fa-star' }
  ];
}

// Render a product card HTML
function productCard(p) {
  const isOutOfStock = p.quantity <= 0;
  const imgContent = p.images && p.images.length > 0
    ? `<img src="${p.images[0]}" alt="${p.name}" loading="lazy" />`
    : `<div class="no-img"><i class="fas fa-gem"></i></div>`;
  const colors = p.colors && p.colors.length > 0
    ? `<div class="product-colors">${p.colors.map(c => `<span class="color-dot" style="background:${c}"></span>`).join('')}</div>` : '';
  const badge = p.badge ? `<div class="product-badge">${p.badge}</div>` : '';
  const oos = isOutOfStock ? `<div class="out-of-stock-badge">Sold Out</div>` : '';
  const oldPrice = p.oldPrice ? `<span class="old-price">${p.oldPrice} AZN</span>` : '';

  return `
  <div class="product-card" onclick="openModal(${p.id})">
    <div class="product-img">
      ${imgContent}
      ${badge}
      ${oos}
      <div class="product-actions">
        <button title="Quick view" onclick="event.stopPropagation();openModal(${p.id})"><i class="fas fa-eye"></i></button>
        ${!isOutOfStock ? `<button title="Add to bag" onclick="event.stopPropagation();addToCart(${p.id})"><i class="fas fa-shopping-bag"></i></button>` : ''}
        <button title="WhatsApp inquiry" onclick="event.stopPropagation();inquireProduct(${p.id})"><i class="fab fa-whatsapp"></i></button>
      </div>
    </div>
    <div class="product-info">
      <div class="product-cat">${p.category}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-price">${oldPrice}${p.price} AZN</div>
      ${colors}
    </div>
  </div>`;
}
