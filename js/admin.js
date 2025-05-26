// === Admin Script for Standalone Admin Pages ===

// Only define API_URL if not already defined
if (typeof API_URL === 'undefined') {
  var API_URL = 'https://ghanish-backend.onrender.com';
}

// Authorization
const token = localStorage.getItem('token');
if (!token) {
  alert("Unauthorized");
  location.href = "/login.html";
}

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// === Highlight Active Nav Link ===
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  document.querySelectorAll('#adminNavbar .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

// === Page-Specific Initialization ===
document.addEventListener('DOMContentLoaded', () => {
  const page = location.pathname;

  if (page === '/admin.html') loadStats();
  if (page === '/admin-orders.html') fetchOrders();
  if (page === '/admin-products.html') fetchProducts();
  if (page === '/admin-users.html') fetchUsers();
  if (page === '/admin-discounts.html') fetchDiscountCodes();
  if (page === '/admin-analytics.html') fetchRevenueAnalytics();
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
    fetchOrders(currentOrderPage);
  });
}

// === Revenue & Analytics ===
window.fetchRevenueAnalytics = function () {
  fetch(`${API_URL}/api/admin/analytics`, { headers })
    .then(r => r.json())
    .then(data => {
      if (!data.topProducts || !data.orderTrends) return;

      const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
      const topProductsCtx = document.getElementById('topProductsChart')?.getContext('2d');

      if (revenueCtx) {
        new Chart(revenueCtx, {
          type: 'bar',
          data: {
            labels: data.orderTrends.labels,
            datasets: [{
              label: 'Orders per Month',
              data: data.orderTrends.values,
              backgroundColor: 'rgba(54, 162, 235, 0.6)'
            }]
          }
        });
      }

      if (topProductsCtx) {
        new Chart(topProductsCtx, {
          type: 'doughnut',
          data: {
            labels: data.topProducts.labels,
            datasets: [{
              label: 'Top Products',
              data: data.topProducts.values,
              backgroundColor: [
                '#4dc9f6', '#f67019', '#f53794',
                '#537bc4', '#acc236', '#166a8f',
                '#00a950', '#58595b', '#8549ba'
              ]
            }]
          }
        });
      }
    });
};

// Remaining user/product/discount/view/save/edit/reset/delete functions are the same as previous steps
// You may paste them here as part of final bundling.

// === Product Form Logic ===
window.showProductForm = function (id) {
  if (typeof id === 'number') {
    fetch(`${API_URL}/api/products`, { headers })
      .then(r => r.json())
      .then(data => {
        const product = data.find(p => p.id === id);
        if (!product) return;
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDesc').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productImage').value = product.image_url;
        updateImagePreview();
      });
  } else {
    document.getElementById('productForm').reset();
  }
  document.getElementById('productForm').classList.remove('d-none');
};

window.hideProductForm = function () {
  document.getElementById('productForm').classList.add('d-none');
};

window.updateImagePreview = function () {
  const url = document.getElementById('productImage').value;
  const preview = document.getElementById('imagePreview');
  if (url) {
    preview.src = url;
    preview.classList.remove('d-none');
  } else {
    preview.classList.add('d-none');
  }
};

window.deleteProduct = function (id) {
  if (!confirm('Delete this product?')) return;
  fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers
  }).then(() => fetchProducts());
};

// === User Form Logic ===
window.showUserForm = function () {
  document.getElementById('userForm').reset();
  document.getElementById('userForm').classList.remove('d-none');
};

window.hideUserForm = function () {
  document.getElementById('userForm').classList.add('d-none');
};

window.editUser = function (id) {
  fetch(`${API_URL}/api/admin/users`, { headers })
    .then(r => r.json())
    .then(data => {
      const users = data.users || data;
      const user = users.find(u => u.id === id);
      if (!user) return;

      document.getElementById('userId').value = user.id;
      document.getElementById('userFullName').value = user.full_name;
      document.getElementById('userEmail').value = user.email;
      document.getElementById('userPhone').value = user.phone;
      document.getElementById('userRole').value = user.role;
      showUserForm();
    });
};

window.resetPassword = function (id) {
  const newPassword = prompt('Enter new password (min 6 characters):');
  if (!newPassword || newPassword.length < 6) return alert('Password too short.');

  fetch(`${API_URL}/api/admin/users/${id}/reset-password`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ newPassword })
  }).then(() => {
    alert('Password reset successfully.');
  });
};

window.deleteUser = function (id) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  fetch(`${API_URL}/api/admin/users/${id}`, {
    method: 'DELETE',
    headers
  }).then(() => fetchUsers());
};

// === Discount Form Logic ===
window.showDiscountForm = function (id) {
  const form = document.getElementById('discountForm');
  form.reset();
  form.classList.remove('d-none');
  if (typeof id === 'number') {
    fetch(`${API_URL}/api/discounts`, { headers })
      .then(r => r.json())
      .then(discounts => {
        const discount = discounts.find(d => d.id === id);
        if (!discount) return;
        document.getElementById('discountCode').value = discount.code;
        document.getElementById('discountPercent').value = discount.percent_off;
        document.getElementById('discountExpires').value = discount.expires_at?.slice(0, 16) || '';
        form.dataset.editingId = id;
      });
  } else {
    form.dataset.editingId = '';
  }
};

window.hideDiscountForm = function () {
  document.getElementById('discountForm').classList.add('d-none');
};

window.deleteDiscountCode = function (id) {
  if (!confirm('Delete this discount code?')) return;
  fetch(`${API_URL}/api/discounts/${id}`, {
    method: 'DELETE',
    headers
  }).then(() => fetchDiscountCodes());
};

// === View Order Modal Logic ===
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
