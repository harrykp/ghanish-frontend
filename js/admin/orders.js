// js/admin/orders.js
import { showToast } from './utils.js';

const token = localStorage.getItem('token');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

let allOrders = [];
let currentOrderPage = 1;
const ordersPerPage = 10;

export function fetchOrders(page = 1) {
  currentOrderPage = page;
  fetch(`${API_URL}/api/orders/all?page=${page}&limit=${ordersPerPage}`, { headers })
    .then(r => r.json())
    .then(data => {
      allOrders = data.orders || [];
      renderOrderTable(allOrders, page, data.total);
    });
}

export function renderOrderTable(orders, currentPage, totalOrders) {
  const list = document.getElementById('orderList');
  list.innerHTML = `
    <table class="table table-bordered">
      <thead><tr><th>ID</th><th>User</th><th>Total</th><th>Status</th><th>Change</th></tr></thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td>${o.id}</td>
            <td><strong>${o.full_name || '—'}</strong><br/><small>${o.phone || '–'}</small></td>
            <td>USD ${parseFloat(o.total).toFixed(2)}</td>
            <td>${o.status}</td>
            <td>
              <button class="btn btn-sm btn-info me-2 view-order-btn" data-id="${o.id}" data-name="${o.full_name}" data-phone="${o.phone}" data-status="${o.status}" data-date="${o.created_at}" data-total="${o.total}">View</button>
              <select class="form-select form-select-sm status-select" data-id="${o.id}">
                ${['pending','processing','shipped','delivered'].map(s =>
                  `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="d-flex justify-content-between mt-3">
      <button class="btn btn-outline-secondary" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}" id="ordersPrevBtn">Previous</button>
      <span class="align-self-center">Page ${currentPage} of ${Math.ceil(totalOrders / ordersPerPage)}</span>
      <button class="btn btn-outline-secondary" ${currentPage * ordersPerPage >= totalOrders ? 'disabled' : ''} data-page="${currentPage + 1}" id="ordersNextBtn">Next</button>
    </div>
  `;

  document.getElementById('ordersPrevBtn')?.addEventListener('click', e => {
    fetchOrders(+e.target.dataset.page);
  });
  document.getElementById('ordersNextBtn')?.addEventListener('click', e => {
    fetchOrders(+e.target.dataset.page);
  });

  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', e => {
      updateOrderStatus(e.target.dataset.id, e.target.value);
    });
  });

  document.querySelectorAll('.view-order-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const phone = btn.dataset.phone;
      const status = btn.dataset.status;
      const date = btn.dataset.date;
      const total = btn.dataset.total;
      viewOrderDetails(id, name, phone, status, date, total);
    });
  });
}

export function updateOrderStatus(id, status) {
  fetch(`${API_URL}/api/orders/${id}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status })
  }).then(() => {
    showToast('Status updated', 'success');
    fetchOrders(currentOrderPage);
  });
}

export function exportOrdersToCSV() {
  const rows = [
    ['Order ID', 'Name', 'Phone', 'Total', 'Status', 'Created At'],
    ...allOrders.map(o => [
      o.id, o.full_name || '-', o.phone || '-', o.total, o.status, o.created_at
    ])
  ];
  const csv = rows.map(r => r.map(x => `"${x}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function printOrderModal() {
  const modalContent = document.querySelector('#orderModal .modal-content').innerHTML;
  const win = window.open('', '_blank', 'width=800,height=600');
  win.document.write(`
    <html><head><title>Print Order</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    </head><body>${modalContent}</body></html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 500);
}

function viewOrderDetails(id, full_name, phone, status, createdAt, total) {
  document.getElementById('modalCustomerName').textContent = full_name || '–';
  document.getElementById('modalCustomerPhone').textContent = phone || '–';
  document.getElementById('modalOrderStatus').textContent = status;
  document.getElementById('modalOrderDate').textContent = new Date(createdAt).toLocaleString();
  document.getElementById('modalOrderTotal').textContent = `USD ${parseFloat(total).toFixed(2)}`;
  document.getElementById('modalViewProfileLink').href = `profile.html?user=${encodeURIComponent(full_name)}`;

  const body = document.getElementById('modalItemsBody');
  body.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

  fetch(`${API_URL}/api/orders/${id}/admin`, { headers })
    .then(r => r.json())
    .then(order => {
      if (!order.items || !order.items.length) {
        body.innerHTML = '<tr><td colspan="4">No items found</td></tr>';
        return;
      }
      body.innerHTML = order.items.map(item => `
        <tr>
          <td>${item.product_name}</td>
          <td>${item.quantity}</td>
          <td>USD ${parseFloat(item.unit_price).toFixed(2)}</td>
          <td>USD ${parseFloat(item.subtotal).toFixed(2)}</td>
        </tr>
      `).join('');
    })
    .catch(() => {
      body.innerHTML = '<tr><td colspan="4">Failed to load items</td></tr>';
    });

  new bootstrap.Modal(document.getElementById('orderModal')).show();
}
