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

// === STATS ===
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

function viewOrderDetails(orderId, full_name, phone, status, createdAt, total) {
  document.getElementById('modalCustomerName').textContent = full_name || '–';
  document.getElementById('modalCustomerPhone').textContent = phone || '–';
  document.getElementById('modalOrderStatus').textContent = status;
  document.getElementById('modalOrderDate').textContent = new Date(createdAt).toLocaleString();
  document.getElementById('modalOrderTotal').textContent = `USD ${parseFloat(total).toFixed(2)}`;
  document.getElementById('modalViewProfileLink').href = `profile.html?user=${encodeURIComponent(full_name)}`;

  const body = document.getElementById('modalItemsBody');
  body.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

  fetch(`${API_URL}/api/orders/${orderId}/admin`, { headers })
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

// === PRODUCTS ===
function fetchProducts() {
  fetch(`${API_URL}/api/products`, { headers })
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById('productList');
      list.innerHTML = `
        <table class="table table-bordered">
          <thead><tr><th>Name</th><th>Price</th><th>Actions</th></tr></thead>
          <tbody>
            ${data.map(p => `
              <tr>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    ${p.image_url ? `<img src="${p.image_url}" alt="" style="height:40px;">` : ''}
                    <span>${p.name}</span>
                  </div>
                </td>
                <td>USD ${parseFloat(p.price).toFixed(2)}</td>
                <td>
                  <button class="btn btn-sm btn-warning me-1 edit-product-btn" data-product='${JSON.stringify(p)}'>Edit</button>
                  <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>`;
    });
}

// === DISCOUNTS ===
function fetchDiscountCodes() {
  fetch(`${API_URL}/api/discounts`, { headers })
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById('discountList');
      if (!data.length) {
        list.innerHTML = '<p>No codes found.</p>';
        return;
      }
      list.innerHTML = `
        <table class="table table-bordered">
          <thead><tr><th>Code</th><th>% Off</th><th>Expires</th><th>Actions</th></tr></thead>
          <tbody>
            ${data.map(d => `
              <tr>
                <td>${d.code}</td>
                <td>${d.percent_off}%</td>
                <td>${d.expires_at ? new Date(d.expires_at).toLocaleString() : '—'}</td>
                <td><button class="btn btn-sm btn-danger" onclick="deleteDiscountCode(${d.id})">Delete</button></td>
              </tr>`).join('')}
          </tbody>
        </table>`;
    });
}

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

function editUser(id) {
  fetch(`${API_URL}/api/admin/users/${id}`, { headers })
    .then(r => r.json())
    .then(user => {
      document.getElementById('userId').value = user.id;
      document.getElementById('userFullName').value = user.full_name;
      document.getElementById('userEmail').value = user.email;
      document.getElementById('userPhone').value = user.phone;
      document.getElementById('userRole').value = user.role;
      document.getElementById('userForm').classList.remove('d-none');
    });
}

// === INIT ===
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

  document.addEventListener('click', e => {
    if (e.target.classList.contains('edit-product-btn')) {
      try {
        const productData = JSON.parse(e.target.dataset.product);
        showProductForm(productData);
      } catch (err) {
        showToast('Failed to load product data', 'danger');
      }
    }
  });
});
