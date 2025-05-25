const token = localStorage.getItem('token');
if (!token) {
  alert("Unauthorized");
  location.href = "login.html";
}

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

let allOrders = [];
let currentOrderPage = 1;
const ordersPerPage = 10;

function loadStats() {
  fetch(`${API_URL}/api/orders/all`, { headers })
    .then(r => r.json())
    .then(data => {
      const orders = data.orders || [];
      document.getElementById('statOrders').textContent = orders.length;
      document.getElementById('statPending').textContent = orders.filter(o => o.status === 'pending').length;
    });

  fetch(`${API_URL}/api/products`, { headers })
    .then(r => r.json())
    .then(data => {
      document.getElementById('statProducts').textContent = data.length;
    });
}

// === ORDERS ===
function fetchOrders(page = 1) {
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
    showToast('Status updated', 'success');
    fetchOrders(currentOrderPage);
  });
}

function exportOrdersToCSV() {
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

function printOrderModal() {
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

document.getElementById('orderFilterInput')?.addEventListener('input', e => {
  const val = e.target.value.trim().toLowerCase();
  const filtered = allOrders.filter(o =>
    o.status.toLowerCase().includes(val) ||
    o.full_name?.toLowerCase().includes(val) ||
    o.phone?.toLowerCase().includes(val)
  );
  renderOrderTable(filtered, 1, filtered.length);
});

// === USERS ===
function fetchUsers() {
  fetch(`${API_URL}/api/admin/users`, { headers })
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById('userList');
      if (!Array.isArray(data)) {
        list.innerHTML = '<div class="alert alert-warning">Failed to load users.</div>';
        return;
      }

      list.innerHTML = `
        <table class="table table-bordered">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            ${data.map(u => `
              <tr>
                <td>${u.full_name}</td>
                <td>${u.email}</td>
                <td>${u.phone}</td>
                <td>${u.role}</td>
                <td>
                  <button class="btn btn-sm btn-warning me-1" onclick="editUser(${u.id})">Edit</button>
                  <button class="btn btn-sm btn-danger me-1" onclick="deleteUser(${u.id})">Delete</button>
                  <button class="btn btn-sm btn-secondary" onclick="resetPassword(${u.id})">Reset Password</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>`;
    });
}

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('#adminTabs .nav-link');
  if (tabButtons.length) {
    const tabTrigger = new bootstrap.Tab(tabButtons[0]);
    tabTrigger.show();
    tabButtons.forEach(btn => {
      btn.addEventListener('shown.bs.tab', e => {
        const target = e.target.getAttribute('href');
        if (target === '#orders') fetchOrders();
        if (target === '#products') fetchProducts();
        if (target === '#analytics') fetchRevenueAnalytics();
        if (target === '#discounts') fetchDiscountCodes();
        if (target === '#users') fetchUsers();
      });
    });
    fetchOrders();
    loadStats();
  }
});
