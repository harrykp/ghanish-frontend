// orders.js
import { API_URL, headers, showToast } from './utils.js';

let allOrders = [];
let currentPage = 1;
const perPage = 10;

export function fetchOrders(page = 1) {
  currentPage = page;
  fetch(`${API_URL}/api/orders/all?page=${page}&limit=${perPage}`, { headers })
    .then(r => r.json())
    .then(data => {
      allOrders = data.orders || [];
      renderOrderTable(allOrders, page, data.total);
    });
}

export function renderOrderTable(orders, page, total) {
  const list = document.getElementById('orderList');
  list.innerHTML = `
    <table class="table table-bordered">
      <thead><tr><th>ID</th><th>User</th><th>Total</th><th>Status</th><th>Change</th></tr></thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td>${o.id}</td>
            <td><strong>${o.full_name}</strong><br/><small>${o.phone}</small></td>
            <td>USD ${parseFloat(o.total).toFixed(2)}</td>
            <td>${o.status}</td>
            <td>
              <button class="btn btn-info btn-sm me-2" data-id="${o.id}" data-name="${o.full_name}" data-phone="${o.phone}" data-status="${o.status}" data-date="${o.created_at}" data-total="${o.total}">View</button>
              <select class="form-select form-select-sm order-status" data-id="${o.id}">
                ${['pending','processing','shipped','delivered'].map(s =>
                  `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`
                ).join('')}
              </select>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="d-flex justify-content-between mt-3">
      <button class="btn btn-outline-secondary" ${page === 1 ? 'disabled' : ''} data-page="${page - 1}">Previous</button>
      <span class="align-self-center">Page ${page} of ${Math.ceil(total / perPage)}</span>
      <button class="btn btn-outline-secondary" ${page * perPage >= total ? 'disabled' : ''} data-page="${page + 1}">Next</button>
    </div>
  `;
}

export function updateOrderStatus(id, status) {
  fetch(`${API_URL}/api/orders/${id}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status })
  }).then(() => {
    showToast('Status updated', 'success');
    fetchOrders(currentPage);
  });
}
