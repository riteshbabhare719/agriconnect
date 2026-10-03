/* ============================================================
   MARKETPLACE.JS — product browsing, cart, and seller "add product"
   FUTURE: replace localStorage product list with
     fetch(`${AGRI.api.base}/products`) and cart with
     fetch(`${AGRI.api.base}/orders`) once the FastAPI backend exists.
   ============================================================ */
 
const CATEGORY_ICONS = {
  'Seeds': '🌱', 'Fertilizers': '🪴', 'Pesticides': '🧴',
  'Tools': '🧰', 'Equipment': '🚜', 'Organic Products': '🌿',
};
 
// Product and seller names are user-typed and inserted with innerHTML: escape them.
function shopEsc(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}
const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
 
function loadProducts() {
  AGRI.seedIfEmpty(AGRI.KEYS.PRODUCTS, AGRI.mock.products);
  return AGRI.get(AGRI.KEYS.PRODUCTS, []);
}
function saveProducts(list) { AGRI.set(AGRI.KEYS.PRODUCTS, list); }
 
function loadCart() { return AGRI.get(AGRI.KEYS.CART, {}); }
function saveCart(cart) { AGRI.set(AGRI.KEYS.CART, cart); updateCartBadge(); }
 
// Drop cart lines whose product no longer exists (for example, a deleted listing)
function cleanCart() {
  const cart = loadCart();
  const ids = new Set(loadProducts().map(p => p.id));
  let changed = false;
  Object.keys(cart).forEach(id => {
    if (!ids.has(id) || !(cart[id] > 0)) { delete cart[id]; changed = true; }
  });
  if (changed) AGRI.set(AGRI.KEYS.CART, cart);
}
 
function updateCartBadge() {
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  const count = Object.values(loadCart()).reduce((a, b) => a + b, 0);
  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline-flex' : 'none';
}
 
function addToCart(productId) {
  const product = loadProducts().find(p => p.id === productId);
  if (!product) { AGRI.toast('This product is no longer available.', 'error'); return; }
 
  const cart = loadCart();
  const current = cart[productId] || 0;
  if (current >= product.qty) {
    AGRI.toast(`Only ${product.qty} available in stock.`, 'error');
    return;
  }
  cart[productId] = current + 1;
  saveCart(cart);
  AGRI.toast('Added to cart.');
}
 
/* ---------------- product grid (marketplace.html) ---------------- */
function renderProductGrid() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  const category = document.getElementById('categoryFilter')?.value || '';
  const search = (document.getElementById('productSearch')?.value || '').trim().toLowerCase();
 
  const products = loadProducts().filter(p =>
    (!category || p.category === category) &&
    String(p.name).toLowerCase().includes(search)
  );
 
  grid.innerHTML = products.map(p => `
    <div class="card card-hover">
      <div style="font-size:3rem;text-align:center;background:var(--leaf-100);border-radius:12px;padding:20px 0;margin-bottom:12px;">${shopEsc(p.img)}</div>
      <span class="badge">${shopEsc(p.category)}</span>
      <h3 style="margin:8px 0 4px;">${shopEsc(p.name)}</h3>
      ${p.description ? `<p class="text-muted" style="margin:0 0 6px;font-size:0.85rem;">${shopEsc(p.description)}</p>` : ''}
      <p class="text-muted" style="margin:0 0 8px;font-size:0.9rem;">Seller: ${shopEsc(p.seller)} · In stock: ${shopEsc(p.qty)}</p>
      <div class="flex-between flex-wrap gap-8">
        <strong style="font-size:1.15rem;color:var(--leaf-800);">${inr(p.price)}</strong>
        <button class="btn btn-primary btn-sm btn-inline" onclick="addToCart('${p.id}')">Add to Cart</button>
      </div>
    </div>
  `).join('') || `<div class="empty-state" style="grid-column:1/-1;"><span class="emoji">🛒</span><p>No products match your search.</p></div>`;
}
 
function populateCategoryFilter() {
  const sel = document.getElementById('categoryFilter');
  if (!sel) return;
  const keep = sel.value;                       // keep the user's current choice when the list refreshes
  const cats = [...new Set(loadProducts().map(p => p.category))];
  sel.innerHTML = '<option value="">All Categories</option>' +
    cats.map(c => `<option value="${shopEsc(c)}">${shopEsc(c)}</option>`).join('');
  sel.value = keep;
}
 
/* ---------------- add product form ---------------- */
function currentSellerId() {
  const u = AGRI.currentUser();
  return u ? (u.loginId || u.name) : null;
}
 
function initAddProductForm() {
  const form = document.getElementById('addProductForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
 
    if (!AGRI.isLoggedIn()) {
      AGRI.toast('Please log in to list a product.', 'error');
      return;
    }
 
    const name = document.getElementById('prodName').value.trim();
    const price = parseFloat(document.getElementById('prodPrice').value);
    const qty = parseInt(document.getElementById('prodQty').value, 10);
    const category = document.getElementById('prodCategory').value;
    const description = (document.getElementById('prodDescription')?.value || '').trim();
 
    if (name.length < 2) { AGRI.toast('Please enter a product name.', 'error'); return; }
    if (!(price > 0)) { AGRI.toast('Please enter a price above ₹0.', 'error'); return; }
    if (!(qty >= 1)) { AGRI.toast('Quantity must be at least 1.', 'error'); return; }
 
    const products = loadProducts();
    products.push({
      id: 'p' + Date.now(),
      name,
      category,
      price,
      qty,
      description,
      seller: AGRI.currentUser()?.name || 'You',
      ownerId: currentSellerId(),
      img: CATEGORY_ICONS[category] || '🌾',
    });
    saveProducts(products);
    populateCategoryFilter();
    renderProductGrid();
    renderMyProducts();
    form.reset();
    AGRI.toast('Product listed on the marketplace.');
    document.getElementById('addProductModal')?.classList.remove('show');
  });
}
 
function renderMyProducts() {
  const list = document.getElementById('myProductsList');
  if (!list) return;
  const me = currentSellerId();
  const myName = AGRI.currentUser()?.name;
  // Match by owner id; older listings without one fall back to the seller name
  const mine = loadProducts().filter(p => p.ownerId ? p.ownerId === me : (myName && p.seller === myName));
 
  list.innerHTML = mine.map(p => `
    <div class="flex-between flex-wrap gap-8" style="padding:10px 0;border-bottom:1px solid var(--border-soft);">
      <span>${shopEsc(p.img)} ${shopEsc(p.name)} — ${inr(p.price)}</span>
      <button class="btn btn-danger btn-sm btn-inline" onclick="deleteProduct('${p.id}')">Delete</button>
    </div>
  `).join('') || '<p class="text-muted mb-0">You have not listed any products yet.</p>';
}
 
function deleteProduct(id) {
  if (!confirm('Remove this product listing?')) return;
  saveProducts(loadProducts().filter(p => p.id !== id));
  cleanCart();
  updateCartBadge();
  populateCategoryFilter();
  renderProductGrid();
  renderMyProducts();
  AGRI.toast('Product removed.');
}
 
/* ---------------- cart page (cart.html) ---------------- */
function renderCartPage() {
  const container = document.getElementById('cartItems');
  if (!container) return;
  const cart = loadCart();
  const products = loadProducts();
  const entries = Object.entries(cart).filter(([, qty]) => qty > 0);
 
  if (entries.length === 0) {
    container.innerHTML = `<div class="empty-state"><span class="emoji">🛒</span><p>Your cart is empty.</p><a href="marketplace.html" class="btn btn-primary btn-inline">Browse Marketplace</a></div>`;
    document.getElementById('cartTotal').textContent = '₹0';
    return;
  }
 
  let total = 0;
  container.innerHTML = entries.map(([id, qty]) => {
    const p = products.find(pr => pr.id === id);
    if (!p) return '';
    const lineTotal = p.price * qty;
    total += lineTotal;
    return `
      <div class="card flex-between flex-wrap gap-16" style="margin-bottom:12px;">
        <div class="flex gap-12" style="align-items:center;">
          <div style="font-size:2rem;">${shopEsc(p.img)}</div>
          <div>
            <strong>${shopEsc(p.name)}</strong>
            <p class="text-muted mb-0" style="font-size:0.9rem;">${inr(p.price)} each</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-8" style="align-items:center;">
          <button class="btn btn-outline btn-sm btn-inline" onclick="changeQty('${id}', -1)" aria-label="Decrease quantity">−</button>
          <span style="min-width:24px;text-align:center;">${qty}</span>
          <button class="btn btn-outline btn-sm btn-inline" onclick="changeQty('${id}', 1)" aria-label="Increase quantity">+</button>
          <strong style="min-width:90px;text-align:right;">${inr(lineTotal)}</strong>
          <button class="btn btn-danger btn-sm btn-inline" onclick="changeQty('${id}', -${qty})">Remove</button>
        </div>
      </div>`;
  }).join('');
 
  document.getElementById('cartTotal').textContent = inr(total);
}
 
function changeQty(id, delta) {
  const cart = loadCart();
  const product = loadProducts().find(p => p.id === id);
  const next = (cart[id] || 0) + delta;
 
  if (delta > 0 && product && next > product.qty) {
    AGRI.toast(`Only ${product.qty} available in stock.`, 'error');
    return;
  }
  if (next <= 0) delete cart[id]; else cart[id] = next;
  saveCart(cart);
  renderCartPage();
}
 
document.addEventListener('DOMContentLoaded', () => {
  cleanCart();
  updateCartBadge();
  if (document.getElementById('productGrid')) {
    populateCategoryFilter();
    renderProductGrid();
    document.getElementById('categoryFilter')?.addEventListener('change', renderProductGrid);
    document.getElementById('productSearch')?.addEventListener('input', renderProductGrid);
    renderMyProducts();
    initAddProductForm();
  }
  if (document.getElementById('cartItems')) renderCartPage();
});
 