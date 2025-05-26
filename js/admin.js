// === Admin Dashboard Script ===
const token = localStorage.getItem('token');
if (!token) {
  alert("Unauthorized");
  location.href = "login.html";
}

const API_URL = 'https://ghanish-backend.onrender.com'; // Add this if missing
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// === Nav Link Highlighting ===
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const links = document.querySelectorAll('#adminNavbar .nav-link');
  links.forEach(link => {
    if (link.getAttribute('href') === path) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

// === Page-Aware Initialization ===
document.addEventListener('DOMContentLoaded', () => {
  const page = location.pathname;

  if (page === '/admin.html') {
    loadStats();
  }

  if (page === '/admin-orders.html') {
    fetchOrders();
  }

  if (page === '/admin-products.html') {
    fetchProducts();
  }

  if (page === '/admin-users.html') {
    fetchUsers();
  }

  if (page === '/admin-discounts.html') {
    fetchDiscountCodes();
  }

  if (page === '/admin-analytics.html') {
    fetchRevenueAnalytics();
  }
});

// === Dashboard Stats ===
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

// === Orders ===
let allOrders = [];
let currentOrderPage = 1;
const ordersPerPage = 10;

function fetchOrders(page = 1) {
  currentOrderPage = page;
  fetch(`${API_URL}/api/orders/all?page=${page}&limit=${ordersPerPage}`, { headers })
    .then(r => r.json())
    .then(data => {
      allOrders = data.orders || [];
      renderOrderTable(allOrders, page, data.total);
    });
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
  const modalContent = document.querySelector('#orderModal .modal-content')?.innerHTML;
  if (!modalContent) return;
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

// === Placeholder global handlers (to define or retain from your previous logic)
window.fetchRevenueAnalytics = function () { /* to be implemented */ };
window.fetchProducts = function () { /* to be implemented */ };
window.fetchUsers = function () { /* to be implemented */ };
window.fetchDiscountCodes = function () { /* to be implemented */ };
window.saveProduct = function () { /* to be implemented */ };
window.saveUser = function () { /* to be implemented */ };
window.saveDiscountCode = function () { /* to be implemented */ };
window.showProductForm = function () { document.getElementById('productForm')?.classList.remove('d-none'); };
window.showUserForm = function () { document.getElementById('userForm')?.classList.remove('d-none'); };
window.showDiscountForm = function () { document.getElementById('discountForm')?.classList.remove('d-none'); };
window.hideProductForm = function () { document.getElementById('productForm')?.classList.add('d-none'); };
window.hideUserForm = function () { document.getElementById('userForm')?.classList.add('d-none'); };
window.hideDiscountForm = function () { document.getElementById('discountForm')?.classList.add('d-none'); };
window.viewOrderDetails = function () { /* to be implemented */ };
window.editUser = function () { /* to be implemented */ };
window.resetPassword = function () { /* to be implemented */ };
window.deleteUser = function () { /* to be implemented */ };
