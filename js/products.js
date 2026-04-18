// ============================================================
//  BLING BLING BAKU — Products (Supabase)
//  All data comes from Supabase database — real & global
// ============================================================

// ---- FETCH PRODUCTS FOR SHOP & HOME (includes hidden/inactive — they render as sold out, no WhatsApp) ----
async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getProducts error:', error); return []; }
  return data || [];
}

// ---- FETCH ALL PRODUCTS (admin, includes inactive) ----
async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getAllProducts error:', error); return []; }
  return data || [];
}

// ---- FETCH SINGLE PRODUCT ----
async function getProduct(id) {
  const { data, error } = await supabase
    .from('products').select('*').eq('id', id).single();
  if (error) { console.error('getProduct error:', error); return null; }
  return data;
}

// ---- CREATE PRODUCT ----
async function createProduct(product) {
  const { data, error } = await supabase
    .from('products').insert([product]).select().single();
  if (error) return { error };
  return { data };
}

// ---- UPDATE PRODUCT ----
async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products').update(updates).eq('id', id).select().single();
  if (error) return { error };
  return { data };
}

// ---- DELETE PRODUCT ----
async function deleteProductById(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return { error };
  return { success: true };
}

// ---- UPLOAD IMAGE to Supabase Storage ----
async function uploadProductImage(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const fileName = `product_${Date.now()}_${Math.random().toString(36).substr(2,6)}.${ext}`;
  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });
  if (error) { console.error('Upload error:', error); return null; }
  const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
  return data.publicUrl;
}

// ---- CATEGORIES ----
function getCategories() {
  return [
    { key: 'necklaces',   label: 'Necklaces',   icon: 'fas fa-gem' },
    { key: 'earrings',    label: 'Earrings',    icon: 'fas fa-circle' },
    { key: 'rings',       label: 'Rings',       icon: 'fas fa-ring' },
    { key: 'bracelets',   label: 'Bracelets',   icon: 'fas fa-link' },
    { key: 'bags',        label: 'Bags',        icon: 'fas fa-shopping-bag' },
    { key: 'accessories', label: 'Accessories', icon: 'fas fa-star' }
  ];
}

// ---- RENDER PRODUCT CARD HTML ----
function productCard(p) {
  const isHidden = p.active === false;
  const isOutOfStockQty = (Number(p.quantity) || 0) <= 0;
  const showSoldOutBadge = isHidden || isOutOfStockQty;
  const canAddToBag = !isHidden && !isOutOfStockQty;
  const showWhatsApp = !isHidden;
  const images = Array.isArray(p.images) ? p.images : [];
  const colors = Array.isArray(p.colors) ? p.colors : [];
  const imgContent = images.length
    ? `<img src="${images[0]}" alt="${p.name}" loading="lazy" />`
    : `<div class="no-img"><i class="fas fa-gem"></i></div>`;
  const colorDots = colors.length
    ? `<div class="product-colors">${colors.map(c => `<span class="color-dot" style="background:${c}"></span>`).join('')}</div>` : '';
  const badge    = p.badge ? `<div class="product-badge">${p.badge}</div>` : '';
  const oos      = showSoldOutBadge ? `<div class="out-of-stock-badge">Sold Out</div>` : '';
  const oldPrice = p.old_price ? `<span class="old-price">${p.old_price} AZN</span>` : '';
  return `
  <article class="product-card" onclick="openModal('${p.id}')">
    <div class="product-img">${imgContent}${badge}${oos}
      <div class="product-actions">
        <button type="button" title="Quick view" onclick="event.stopPropagation();openModal('${p.id}')"><i class="fas fa-eye"></i></button>
        ${canAddToBag ? `<button type="button" title="Add to bag" onclick="event.stopPropagation();addToCart('${p.id}')"><i class="fas fa-shopping-bag"></i></button>` : ''}
        ${showWhatsApp ? `<button type="button" title="WhatsApp" onclick="event.stopPropagation();inquireProduct('${p.id}','${p.name.replace(/'/g,"\\'")}',${p.price})"><i class="fab fa-whatsapp"></i></button>` : ''}
      </div>
    </div>
    <div class="product-info">
      <div class="product-cat">${p.category}</div>
      <h3 class="product-name">${p.name}</h3>
      <div class="product-price">${oldPrice}${p.price} AZN</div>
      ${colorDots}
      <span class="product-cta">View piece</span>
    </div>
  </article>`;
}
