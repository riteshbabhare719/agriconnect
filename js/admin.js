/* ============================================================
   ADMIN.JS — Admin Dashboard UI (demo data from localStorage)
   FUTURE: replace with fetch(`${AGRI.api.base}/admin/*`) calls
   guarded by real admin authentication on the Flask backend.
   ============================================================ */

const ADMIN_FARMERS = [
  { name: 'Ramesh Patil', village: 'Kelwad', crops: 3, status: 'Active' },
  { name: 'Suresh Yadav', village: 'Wardha', crops: 2, status: 'Active' },
  { name: 'Lakshmi Reddy', village: 'Guntur', crops: 4, status: 'Active' },
  { name: 'Meena Devi', village: 'Karnal', crops: 1, status: 'Inactive' },
];

function renderAdminStats() {
  const crops = AGRI.get(AGRI.KEYS.CROPS, AGRI.mock.crops);
  const products = AGRI.get(AGRI.KEYS.PRODUCTS, AGRI.mock.products);
  const posts = AGRI.get(AGRI.KEYS.POSTS, AGRI.mock.posts);

  const stats = [
    { label: 'Total Farmers', value: ADMIN_FARMERS.length, icon: '👨‍🌾' },
    { label: 'Total Products', value: products.length, icon: '🛒' },
    { label: 'Total Crops Tracked', value: crops.length, icon: '🌾' },
    { label: 'Marketplace Orders', value: 27, icon: '📦' },
    { label: 'Transport Providers', value: AGRI.mock.transport.length, icon: '🚚' },
    { label: 'Community Posts', value: posts.length, icon: '💬' },
  ];

  document.getElementById('adminStats').innerHTML = stats.map(s => `
    <div class="card summary-card">
      <div class="icon-box">${s.icon}</div>
      <div><span class="value">${s.value}</span><p class="label">${s.label}</p></div>
    </div>
  `).join('');
}

function renderAdminFarmers() {
  const el = document.getElementById('adminFarmersTable');
  if (!el) return;
  el.innerHTML = ADMIN_FARMERS.map(f => `
    <tr>
      <td style="padding:10px;">${f.name}</td>
      <td style="padding:10px;">${f.village}</td>
      <td style="padding:10px;">${f.crops}</td>
      <td style="padding:10px;"><span class="badge ${f.status === 'Active' ? '' : 'badge-danger'}">${f.status}</span></td>
      <td style="padding:10px;">
        <button class="btn btn-outline btn-sm" onclick="AGRI.toast('Viewing ${f.name} (demo)')">View</button>
        <button class="btn btn-danger btn-sm" onclick="AGRI.toast('${f.name} would be removed (demo)')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderAdminProducts() {
  const el = document.getElementById('adminProductsTable');
  if (!el) return;
  const products = AGRI.get(AGRI.KEYS.PRODUCTS, AGRI.mock.products);
  el.innerHTML = products.map(p => `
    <tr>
      <td style="padding:10px;">${p.img} ${p.name}</td>
      <td style="padding:10px;">${p.category}</td>
      <td style="padding:10px;">₹${p.price.toLocaleString('en-IN')}</td>
      <td style="padding:10px;">
        <button class="btn btn-outline btn-sm" onclick="AGRI.toast('Approved (demo)')">Approve</button>
        <button class="btn btn-danger btn-sm" onclick="AGRI.toast('Removed (demo)')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderAdminReport() {
  const el = document.getElementById('reportBars');
  if (!el) return;
  const data = [
    { label: 'Wheat', value: 82 }, { label: 'Rice', value: 65 },
    { label: 'Cotton', value: 90 }, { label: 'Tomato', value: 40 },
    { label: 'Soybean', value: 55 },
  ];
  el.innerHTML = data.map(d => `
    <div class="flex gap-12" style="align-items:center;margin-bottom:10px;">
      <span style="width:80px;font-size:0.9rem;">${d.label}</span>
      <div style="flex:1;background:var(--leaf-100);border-radius:8px;height:16px;overflow:hidden;">
        <div style="width:${d.value}%;background:var(--leaf-600);height:100%;"></div>
      </div>
      <span style="width:36px;font-size:0.85rem;text-align:right;">${d.value}%</span>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('adminStats')) return;
  renderAdminStats();
  renderAdminFarmers();
  renderAdminProducts();
  renderAdminReport();
});
