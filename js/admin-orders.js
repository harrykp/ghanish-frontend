// === Admin Orders Page ===

let allOrders = [];
let currentOrderPage = 1;
const ordersPerPage = 10;
let currentFilter = '';

document.addEventListener('DOMContentLoaded', () => {
  if (location.pathname === '/admin-orders.html') {
    fetchOrders();

    const filterInput = document.getElementById('orderFilterInput');
    if (filterInput) {
      filterInput.addEventListener('input', () => {
        currentFilter = filterInput.value.trim().toLowerCase();
        renderFilteredOrders();
      });
    }
  }
});

function fetchOrders(page = 1) {
  currentOrderPage = page;
  fetch(`${API_URL}/api/orders/all?page=${page}&limit=${ordersPerPage}`, { headers })
    .then(r => r.json())
    .then(data => {
      allOrders = data.orders || [];
      renderFilteredOrders();
    });
}

function renderFilteredOrders() {
const filtered = currentFilter
  ? allOrders.filter(o =>
      (o.status || '').toLowerCase().includes(currentFilter) ||
      (o.full_name || '').toLowerCase().includes(currentFilter) ||
      (o.phone || '').toLowerCase().includes(currentFilter)
    )
  : allOrders;

  renderOrderTable(filtered, currentOrderPage, filtered.length);
}

function renderOrderTable(orders, currentPage, totalOrders) {
  const list = document.getElementById('orderList');
  if (!list) return;
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
              <button class="btn btn-sm btn-info me-2" onclick="viewOrderDetails(${o.id}, '${o.full_name}', '${o.phone}', '${o.status}', '${o.created_at}', ${o.total})">View</button>
              <select class="form-select mt-1" onchange="updateOrderStatus(${o.id}, this.value)">
                ${['pending','processing','shipped','delivered'].map(s =>
                  `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="d-flex justify-content-between mt-3">
      <button class="btn btn-outline-secondary" ${currentPage === 1 ? 'disabled' : ''} onclick="fetchOrders(${currentPage - 1})">Previous</button>
      <span class="align-self-center">Page ${currentPage} of ${Math.ceil(totalOrders / ordersPerPage)}</span>
      <button class="btn btn-outline-secondary" ${currentPage * ordersPerPage >= totalOrders ? 'disabled' : ''} onclick="fetchOrders(${currentPage + 1})">Next</button>
    </div>`;
}

function updateOrderStatus(id, status) {
  fetch(`${API_URL}/api/orders/${id}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status })
  }).then(() => {
    fetchOrders(currentOrderPage);
  });
}

window.viewOrderDetails = function (id, name, phone, status, date, total) {
  document.getElementById('modalCustomerName').textContent = name;
  document.getElementById('modalCustomerPhone').textContent = phone;
  document.getElementById('modalOrderStatus').textContent = status;
  document.getElementById('modalOrderDate').textContent = new Date(date).toLocaleString();
  document.getElementById('modalOrderTotal').textContent = `USD ${parseFloat(total).toFixed(2)}`;
  document.getElementById('modalViewProfileLink').href = `/profile.html?id=${id}`;

  fetch(`${API_URL}/api/orders/${id}/admin`, { headers })
    .then(r => r.json())
    .then(data => {
      const body = document.getElementById('modalItemsBody');
      if (!body) return;
      body.innerHTML = data.items.map(item => `
        <tr>
          <td>${item.product_name}</td>
          <td>${item.quantity}</td>
          <td>USD ${parseFloat(item.unit_price).toFixed(2)}</td>
          <td>USD ${parseFloat(item.subtotal).toFixed(2)}</td>
        </tr>
      `).join('');
      const modal = new bootstrap.Modal(document.getElementById('orderModal'));
      modal.show();
    });
};

window.exportOrdersToCSV = function () {
  const filtered = currentFilter
    ? allOrders.filter(o => o.status.toLowerCase().includes(currentFilter))
    : allOrders;

  if (!filtered.length) {
    showToast('No orders to export.', 'warning');
    return;
  }

  const rows = [
    ['Order ID', 'Name', 'Phone', 'Total', 'Status', 'Created At'],
    ...filtered.map(o => [
      o.id,
      o.full_name || '-',
      o.phone || '-',
      o.total,
      o.status,
      o.created_at
    ])
  ];

  const csv = rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

window.printOrderModal = function () {
  const modalContent = document.querySelector('#orderModal .modal-content');
  if (!modalContent) {
    showToast('No order selected to print.', 'warning');
    return;
  }

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Order</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { padding: 20px; font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>${modalContent.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};
