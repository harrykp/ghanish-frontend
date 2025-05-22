// admin.js

const token = localStorage.getItem('token');
if (!token) {
  alert("Unauthorized");
  location.href = "login.html";
}

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
console.log('Token role check:', localStorage.getItem('token'));

function loadStats() {
  fetch(`${API_URL}/api/orders/all`, { headers })
    .then(r => r.json())
    .then(data => {
      document.getElementById('statOrders').textContent = data.length;
      document.getElementById('statPending').textContent = data.filter(o => o.status === 'pending').length;
    });

  fetch(`${API_URL}/api/products`, { headers })
    .then(r => r.json())
    .then(data => {
      document.getElementById('statProducts').textContent = data.length;
    });
}


// === ORDERS ===
function fetchOrders() {
  fetch(`${API_URL}/api/orders/all`, { headers })
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById('orderList');
      list.innerHTML = '<table class="table table-bordered"><thead><tr><th>ID</th><th>User</th><th>Total</th><th>Status</th><th>Change</th></tr></thead><tbody>' +
        data.map(o => `
          <tr>
            <td>${o.id}</td>
            <td>
              <strong>${o.full_name || '—'}</strong><br/>
              <small>${o.phone || '–'}</small>
            </td>

            <td>USD ${parseFloat(o.total).toFixed(2)}</td>
            <td>${o.status}</td>
            <td>
              <button class="btn btn-sm btn-info me-2" onclick="viewOrderDetails(${o.id}, '${o.full_name}', '${o.phone}', '${o.status}', '${o.created_at}', ${o.total})">
                View
              </button>
              <select class="form-select mt-1" onchange="updateOrderStatus(${o.id}, this.value)">

                ${['pending','processing','shipped','delivered'].map(s =>
                  `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`
                ).join('')}
              </select>
            </td>
          </tr>
        `).join('') +
        '</tbody></table>';
    });
}

function updateOrderStatus(id, status) {
  fetch(`${API_URL}/api/orders/${id}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status })
  }).then(() => showToast('Status updated', 'success'));
}

// === PRODUCTS ===
function fetchProducts() {
  fetch(`${API_URL}/api/products`, { headers })
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById('productList');
      list.innerHTML = '<table class="table table-bordered"><thead><tr><th>Name</th><th>Price</th><th>Actions</th></tr></thead><tbody>' +
        data.map(p => `
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
          </tr>`).join('') +
        '</tbody></table>';

    });
}

// Attach edit button handler using event delegation
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

function showProductForm(p = {}) {
  document.getElementById('productForm').classList.remove('d-none');
  document.getElementById('productId').value = p.id || '';
  document.getElementById('productName').value = p.name || '';
  document.getElementById('productDesc').value = p.description || '';
  document.getElementById('productPrice').value = p.price || '';
  document.getElementById('productStock').value = p.stock || '';
  document.getElementById('productImage').value = p.image_url || '';

  // 🔥 Set form title based on mode
  const title = document.getElementById('productFormTitle');
  title.textContent = p.id ? 'Edit Product' : 'New Product';

  // Trigger image preview
  updateImagePreview();
}


function hideProductForm() {
  document.getElementById('productForm').reset();
  document.getElementById('productForm').classList.add('d-none');
  const preview = document.getElementById('imagePreview');
  preview.src = '';
  preview.classList.add('d-none');
}


function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('productId').value;
  const body = {
    name: document.getElementById('productName').value,
    description: document.getElementById('productDesc').value,
    price: document.getElementById('productPrice').value,
    stock: document.getElementById('productStock').value,
    image_url: document.getElementById('productImage').value
  };
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/api/products/${id}` : `${API_URL}/api/products`;
  fetch(url, {
    method,
    headers,
    body: JSON.stringify(body)
  }).then(() => {
    showToast('Product saved', 'success');
    hideProductForm();
    fetchProducts();
  });
}

function deleteProduct(id) {
  if (!confirm('Are you sure?')) return;
  fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers
  }).then(() => {
    showToast('Product deleted', 'success');
    fetchProducts();
  });
}

// === Image Preview ===
function updateImagePreview() {
  const url = document.getElementById('productImage').value.trim();
  const img = document.getElementById('imagePreview');
  if (url) {
    img.src = url;
    img.classList.remove('d-none');
  } else {
    img.src = '';
    img.classList.add('d-none');
  }
}

// === INIT + Tab Switching ===
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
      });
    });

    // Load the default tab data
    fetchOrders();

    // Load dashboard stats
    loadStats();  
  }
function viewOrderDetails(orderId, full_name, phone, status, createdAt, total) {
  document.getElementById('modalCustomerName').textContent = full_name || '–';
  document.getElementById('modalCustomerPhone').textContent = phone || '–';
  document.getElementById('modalOrderStatus').textContent = status;
  document.getElementById('modalOrderDate').textContent = new Date(createdAt).toLocaleString();
  document.getElementById('modalOrderTotal').textContent = `USD ${parseFloat(total).toFixed(2)}`;

  // Clear and fetch items
  const body = document.getElementById('modalItemsBody');
  body.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

  fetch(`${API_URL}/api/orders/${orderId}`, { headers })
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

});
