/* ============================================================
   TRANSPORT.JS — Agricultural Transport listing (mock data)
   FUTURE: replace AGRI.mock.transport with
     fetch(`${AGRI.api.base}/transport?location=...`)
   ============================================================ */

function renderTransport() {
  const grid = document.getElementById('transportGrid');
  if (!grid) return;
  grid.innerHTML = AGRI.mock.transport.map(t => `
    <div class="card card-hover">
      <div class="flex-between">
        <span style="font-size:2rem;">${t.icon}</span>
        <span class="badge ${t.available ? '' : 'badge-danger'}">${t.available ? 'Available' : 'Booked'}</span>
      </div>
      <h3 style="margin:10px 0 4px;">${t.type}</h3>
      <p class="text-muted" style="margin:0 0 4px;">Driver: ${t.driver}</p>
      <p class="text-muted" style="margin:0 0 4px;">Capacity: ${t.capacity}</p>
      <p class="text-muted" style="margin:0 0 10px;">📍 ${t.location}</p>
      <div class="flex-between">
        <strong style="color:var(--leaf-800);">₹${t.price.toLocaleString('en-IN')}</strong>
        <button class="btn btn-primary btn-sm" ${t.available ? '' : 'disabled'} onclick="contactDriver('${t.driver}')">Contact Driver</button>
      </div>
    </div>
  `).join('');
}

function contactDriver(name) {
  AGRI.toast(`Request sent to ${name}. They will contact you shortly. (Demo)`);
}

document.addEventListener('DOMContentLoaded', renderTransport);
