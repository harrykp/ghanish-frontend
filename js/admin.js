const token = localStorage.getItem('token');
if (!token) {
  alert("Unauthorized");
  location.href = "login.html";
}

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

function fetchOrders() {
  fetch(`${API_URL}/api/orders/all`, { headers })
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById('orderList');
      list.innerHTML = '<table class="table table-bordered"><thead><tr><th>ID</th><th>User</th><th>Total</th><th>Status</th><th>Change</th></tr></thead><tbody>' +
        data.map(o => `
          <tr>
            <td>${o.id}</td>
            <td>${o.user_email}</td>
            <td>$${o.total}</td>
            <td>${o.status}</td>
            <td>
              <select class="form-select" onchange="updateOrderStatus(${o.id}, this.value)">
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

function fetchProducts() {
  fetch(`${API_URL}/api/products`)
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById('productList');
      list.innerHTML = '<table class="table table-bordered"><thead><tr><th>Name</th><th>Price</th><th>Actions</th></tr></thead><tbody>' +
        data.map(p => `
          <tr>
            <td>${p.name}</td>
            <td>$${p.price}</td>
            <td>
              <button class="btn btn-sm btn-warning me-1" onclick="editProduct(${encodeURIComponent(JSON.stringify(p))})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
          </tr>`).join('') +
        '</tbody></table>';
    });
}

function showProductForm(p = {}) {
  document.getElementById('productForm').classList.remove('d-none');
  document.getElementById('productId').value = p.id || '';
  document.getElementById('productName').value = p.name || '';
  document.getElementById('productDesc').value = p.description || '';
  document.getElementById('productPrice').value = p.price || '';
  document.getElementById('productImage').value = p.image_url || '';
}

function hideProductForm() {
  document.getElementById('productForm').classList.add('d-none');
}

function editProduct(data) {
  const p = JSON.parse(decodeURIComponent(data));
  showProductForm(p);
}

function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('productId').value;
  const body = {
    name: document.getElementById('productName').value,
    description: document.getElementById('productDesc').value,
    price: document.getElementById('productPrice').value,
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

// Init
document.addEventListener('DOMContentLoaded', () => {
  fetchOrders();
  fetchProducts();
});
