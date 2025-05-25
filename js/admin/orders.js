// orders.js
import { API_URL, headers, showToast } from './utils.js';

let allOrders = [];
let currentPage = 1;
const ordersPerPage = 10;

export function fetchOrders(page = 1) {
  currentPage = page;
  fetch(`${API_URL}/api/orders/all?page=${page}&limit=${ordersPerPage}`, { headers })
    .then(r => r.json())
    .then(data => {
      allOrders = data.orders || [];
      renderOrderTable(allOrders, page, data.total);
    });
}

function renderOrderTable(orders, currentPage, totalOrders) {
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
              <button class="btn btn-sm btn-info me-2 view-btn" data-id="${o.id}">View</button>
              <select class="form-select mt-1 status-select" data-id="${o.id}">
                ${['pending','processing','shipped','delivered'].map(s =>
                  `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>
    <div class="d-flex justify-content-between mt-3">
      <button class="btn btn-outline-secondary" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">Previous</button>
      <span class="align-self-center">Page ${currentPage} of ${Math.ceil(totalOrders / ordersPerPage)}</span>
      <button class="btn btn-outline-secondary" ${currentPage * ordersPerPage >= totalOrders ? 'disabled' : ''} data-page="${currentPage + 1}">Next</button>
    </div>`;

  document.querySelectorAll('.status-select').forEach(el =>
    el.addEventListener('change', () => updateOrderStatus(el.dataset.id, el.value))
  );

  document.querySelectorAll('.view-btn').forEach(el =>
    el.addEventListener('click', () => viewOrderDetails(el.dataset.id))
  );

  document.querySelectorAll('[data-page]').forEach(btn =>
    btn.addEventListener('click', e => fetchOrders(parseInt(e.target.dataset.page)))
  );
}

function updateOrderStatus(id, status) {
  fetch(`${API_URL}/api/orders/${id}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status })
  }).then(() => {
    showToast('Status updated', 'success');
    fetchOrders(currentPage);
  });
}

function viewOrderDetails(id) {
  fetch(`${API_URL}/api/orders/${id}/admin`, { headers })
    .then(r => r.json())
    .then(order => {
      document.getElementById('modalCustomerName').textContent = order.full_name || '–';
      document.getElementById('modalCustomerPhone').textContent = order.phone || '–';
      document.getElementById('modalOrderStatus').textContent = order.status;
      document.getElementById('modalOrderDate').textContent = new Date(order.created_at).toLocaleString();
      document.getElementById('modalOrderTotal').textContent = `USD ${parseFloat(order.total).toFixed(2)}`;
      document.getElementById('modalViewProfileLink').href = `profile.html?user=${encodeURIComponent(order.full_name || '')}`;
      const body = document.getElementById('modalItemsBody');
      if (!order.items || !order.items.length) {
        body.innerHTML = '<tr><td colspan="4">No items found</td></tr>';
      } else {
        body.innerHTML = order.items.map(item => `
          <tr>
            <td>${item.product_name}</td>
            <td>${item.quantity}</td>
            <td>USD ${parseFloat(item.unit_price).toFixed(2)}</td>
            <td>USD ${parseFloat(item.subtotal).toFixed(2)}</td>
          </tr>`).join('');
      }
      new bootstrap.Modal(document.getElementById('orderModal')).show();
    });
}
