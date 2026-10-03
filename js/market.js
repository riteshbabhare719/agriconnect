/* ============================================================
   MARKET.JS — Mandi price search / filter / sort (SAMPLE data)
   FUTURE: replace AGRI.mock.marketPrices with
     fetch(`${AGRI.api.base}/market-prices?district=...&crop=...`)
 
   All prices are sample values in Rs per quintal, for demo only.
   ============================================================ */
 
const rupees = (n) => '₹' + Number(n).toLocaleString('en-IN');
 
const mEsc = (v) => String(v ?? '').replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
 
const CELL_STYLE = 'padding:10px;border-bottom:1px solid var(--border-soft);';
 
function populateMarketFilters() {
  const data = AGRI.mock.marketPrices;
  const districtSel = document.getElementById('filterState');   // id kept so market.html needs no edit
  const cropSel = document.getElementById('filterCrop');
  if (!districtSel) return;
 
  // All sample mandis are in Maharashtra, so a State filter would be useless.
  // Re-use that dropdown as a District filter instead.
  const label = document.querySelector('label[for="filterState"]');
  if (label) label.textContent = 'District';
 
  const districts = [...new Set(data.map(d => d.district))].sort();
  const crops = [...new Set(data.map(d => d.crop))].sort();
 
  districtSel.innerHTML = '<option value="">All Districts</option>' +
    districts.map(s => `<option value="${mEsc(s)}">${mEsc(s)}</option>`).join('');
  cropSel.innerHTML = '<option value="">All Crops</option>' +
    crops.map(c => `<option value="${mEsc(c)}">${mEsc(c)}</option>`).join('');
}
 
/* Adds a small info area under the filters (created here, so no HTML edit) */
function ensureInsightBox() {
  if (document.getElementById('marketInsight')) return;
  const filterCard = document.getElementById('filterState').closest('.card');
  if (!filterCard) return;
  filterCard.insertAdjacentHTML('afterend', `
    <p class="field-hint" style="margin:10px 2px 0;">Sample prices in ₹ per quintal. Demo data, not live mandi rates.</p>
    <div id="marketInsight" class="card" style="display:none;margin-top:14px;border-left:5px solid var(--wheat-500);"></div>
  `);
}
 
/* When the results are for ONE crop at several mandis, say where it sells best */
function renderInsight(rows) {
  const box = document.getElementById('marketInsight');
  if (!box) return null;
 
  const crops = new Set(rows.map(r => r.crop));
  if (crops.size !== 1 || rows.length < 2) {
    box.style.display = 'none';
    return null;
  }
 
  const sorted = [...rows].sort((a, b) => b.avg - a.avg);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const gap = best.avg - worst.avg;
 
  box.style.display = 'block';
  box.innerHTML = `
    <p style="margin:0;font-weight:600;">💡 Best price for ${mEsc(best.crop)}: ${mEsc(best.market)} at ${rupees(best.avg)}</p>
    <p class="text-muted mb-0" style="margin-top:4px;">
      That is ${rupees(gap)} per quintal more than ${mEsc(worst.market)}.
      Subtract transport cost before deciding. See the Transport page for vehicles.
    </p>`;
  return best;
}
 
function renderMarketTable() {
  const tbody = document.getElementById('marketTableBody');
  const cardList = document.getElementById('marketCardList');
  const empty = document.getElementById('marketEmpty');
  if (!tbody) return;
 
  const district = document.getElementById('filterState').value;
  const crop = document.getElementById('filterCrop').value;
  const search = document.getElementById('marketSearch').value.trim().toLowerCase();
  const sortBy = document.getElementById('marketSort').value;
 
  const rows = AGRI.mock.marketPrices.filter(r =>
    (!district || r.district === district) &&
    (!crop || r.crop === crop) &&
    (r.crop.toLowerCase().includes(search) ||
     r.market.toLowerCase().includes(search) ||
     r.district.toLowerCase().includes(search))
  );
 
  if (sortBy === 'priceAsc') rows.sort((a, b) => a.avg - b.avg);
  if (sortBy === 'priceDesc') rows.sort((a, b) => b.avg - a.avg);
  if (sortBy === 'nameAsc') rows.sort((a, b) => a.crop.localeCompare(b.crop));
 
  if (rows.length === 0) {
    tbody.innerHTML = '';
    cardList.innerHTML = '';
    empty.style.display = 'block';
    renderInsight([]);
    return;
  }
  empty.style.display = 'none';
 
  const best = renderInsight(rows);
  const isBest = (r) => best && r.market === best.market && r.crop === best.crop;
  const bestBadge = ' <span class="badge" style="font-size:0.72rem;padding:2px 8px;">Best price</span>';
 
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td style="${CELL_STYLE}">${mEsc(r.crop)}</td>
      <td style="${CELL_STYLE}">${mEsc(r.market)}${isBest(r) ? bestBadge : ''}</td>
      <td style="${CELL_STYLE}">${rupees(r.min)}</td>
      <td style="${CELL_STYLE}">${rupees(r.max)}</td>
      <td style="${CELL_STYLE}"><strong>${rupees(r.avg)}</strong></td>
    </tr>
  `).join('');
 
  cardList.innerHTML = rows.map(r => `
    <div class="card">
      <div class="flex-between gap-12">
        <h3 style="margin:0;">${mEsc(r.crop)}</h3>
        <span class="badge badge-wheat">${rupees(r.avg)}</span>
      </div>
      <p class="text-muted" style="margin:6px 0;">${mEsc(r.market)}, ${mEsc(r.district)}${isBest(r) ? bestBadge : ''}</p>
      <p class="mb-0">Min ${rupees(r.min)} · Max ${rupees(r.max)}</p>
    </div>
  `).join('');
}
 
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('marketTableBody')) return;
  populateMarketFilters();
  ensureInsightBox();
  renderMarketTable();
  ['filterState', 'filterCrop', 'marketSearch', 'marketSort'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', renderMarketTable);
    el.addEventListener('change', renderMarketTable);
  });
});
 