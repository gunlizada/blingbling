// ============================================================
//  BLING BLING BAKU — Products (Supabase)
//  All data comes from Supabase database — real & global
// ============================================================

// ---- HTML ESCAPE (prevents XSS when rendering DB/user text into the DOM) ----
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---- FETCH PRODUCTS FOR SHOP & HOME (includes inactive — inactive shows as sold out, no WhatsApp order) ----
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

// ============================================================
//  LOOKBOOKS (Supabase)
// ============================================================

// ---- FETCH LOOKBOOKS (storefront + admin) ----
async function getLookbooks() {
  const { data, error } = await supabase
    .from('lookbooks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getLookbooks error:', error); return []; }
  return data || [];
}

// ---- FETCH SINGLE LOOKBOOK ----
async function getLookbook(id) {
  const { data, error } = await supabase
    .from('lookbooks').select('*').eq('id', id).single();
  if (error) { console.error('getLookbook error:', error); return null; }
  return data;
}

// ---- UPLOAD LOOKBOOK IMAGE (reuses the product-images bucket) ----
async function uploadLookbookImage(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const fileName = `lookbook_${Date.now()}_${Math.random().toString(36).substr(2,6)}.${ext}`;
  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });
  if (error) { console.error('Lookbook upload error:', error); return null; }
  const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
  return data.publicUrl;
}

// ---- CATEGORIES ----
// Parent categories with optional subcategories. A product's `category` field
// stores a LEAF key (e.g. 'mini-claw-clips'), or the parent key when the parent
// has no subcategories (e.g. 'vanity-case'). No DB schema change needed.
function getCategories() {
  return [
    { key: 'claw-clips', label: 'Claw Clips', icon: 'fas fa-hand-sparkles', subs: [
      { key: 'mini-claw-clips',  label: 'Mini Claw Clips' },
      { key: 'large-claw-clips', label: 'Large Claw Clips' }
    ] },
    { key: 'hairbrush', label: 'Hairbrush', icon: 'fas fa-brush', subs: [
      { key: 'large-hairbrush', label: 'Large Hairbrush' },
      { key: 'small-hairbrush', label: 'Small Hairbrush' },
      { key: 'hair-comb',       label: 'Hair Comb' }
    ] },
    { key: 'vanity-case', label: 'Vanity Case', icon: 'fas fa-suitcase', subs: [] },
    { key: 'mirrors', label: 'Mirrors', icon: 'fas fa-compact-disc', subs: [
      { key: 'hand-mirrors',    label: 'Hand Mirrors' },
      { key: '2-in-1-mirrors',  label: '2 in 1 Mirrors' }
    ] }
  ];
}

// All leaf category keys a filter key represents. A parent expands to its subs
// (or itself if it has none); a leaf/sub key returns itself.
function leafKeysForCategory(key) {
  const g = getCategories().find(x => x.key === key);
  if (g) return g.subs.length ? g.subs.map(s => s.key) : [g.key];
  return [key];
}

// Does a product's stored category match the selected filter key?
function categoryMatches(productCategory, filterKey) {
  if (!filterKey || filterKey === 'all') return true;
  return leafKeysForCategory(filterKey).includes(productCategory);
}

// Human-friendly label for a stored category key (parent or sub).
function categoryLabel(key) {
  for (const g of getCategories()) {
    if (g.key === key) return g.label;
    const s = g.subs.find(x => x.key === key);
    if (s) return s.label;
  }
  return key || '';
}

// ---- RENDER PRODUCT CARD HTML ----
function productCard(p) {
  const isInactive = p.active === false;
  const showSoldOutBadge = isInactive;
  const canAddToBag = !isInactive;
  const showWhatsApp = !isInactive;
  const images = Array.isArray(p.images) ? p.images : [];
  const colors = Array.isArray(p.colors) ? p.colors : [];
  const id      = escapeHtml(p.id);
  const name    = escapeHtml(p.name);
  const imgContent = images.length
    ? `<img src="${escapeHtml(images[0])}" alt="${name}" loading="lazy" />`
    : `<div class="no-img"><i class="fas fa-gem"></i></div>`;
  const colorDots = colors.length
    ? `<div class="product-colors">${colors.map(c => `<span class="color-dot" style="background:${escapeHtml(c)}"></span>`).join('')}</div>` : '';
  const badge    = p.badge ? `<div class="product-badge">${escapeHtml(p.badge)}</div>` : '';
  const oos      = showSoldOutBadge ? `<div class="out-of-stock-badge">Sold Out</div>` : '';
  const oldPrice = p.old_price ? `<span class="old-price">${escapeHtml(p.old_price)} AZN</span>` : '';
  return `
  <article class="product-card" onclick="openModal('${id}')">
    <div class="product-img">${imgContent}${badge}${oos}
      <div class="product-actions">
        <button type="button" title="Quick view" onclick="event.stopPropagation();openModal('${id}')"><i class="fas fa-eye"></i></button>
        ${canAddToBag ? `<button type="button" title="Add to bag" onclick="event.stopPropagation();addToCart('${id}')"><i class="fas fa-shopping-bag"></i></button>` : ''}
        ${showWhatsApp ? `<button type="button" title="WhatsApp" onclick="event.stopPropagation();inquireProduct('${id}')"><i class="fab fa-whatsapp"></i></button>` : ''}
      </div>
    </div>
    <div class="product-info">
      <div class="product-cat">${escapeHtml(categoryLabel(p.category))}</div>
      <h3 class="product-name">${name}</h3>
      <div class="product-price">${oldPrice}${escapeHtml(p.price)} AZN</div>
      ${colorDots}
      <span class="product-cta">View piece</span>
    </div>
  </article>`;
}
