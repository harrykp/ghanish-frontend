// products.js
import { API_URL, headers, showToast } from './utils.js';

export function fetchProducts() {
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
                    ${p.image_url ? `<img src="${p.image_url}" style="height:40px;" />` : ''}
                    <span>${p.name}</span>
                  </div>
                </td>
                <td>USD ${parseFloat(p.price).toFixed(2)}</td>
                <td>
                  <button class="btn btn-sm btn-warning me-1 edit-product-btn" data-product='${JSON.stringify(p)}'>Edit</button>
                  <button class="btn btn-sm btn-danger" data-delete-id="${p.id}">Delete</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>`;

      list.querySelectorAll('[data-delete-id]').forEach(btn =>
        btn.addEventListener('click', () => deleteProduct(btn.dataset.deleteId)));

      list.querySelectorAll('.edit-product-btn').forEach(btn =>
        btn.addEventListener('click', () => {
          const product = JSON.parse(btn.dataset.product);
          showProductForm(product);
        }));
    });
}

export function showProductForm(p = {}) {
  document.getElementById('productForm').classList.remove('d-none');
  document.getElementById('productId').value = p.id || '';
  document.getElementById('productName').value = p.name || '';
  document.getElementById('productDesc').value = p.description || '';
  document.getElementById('productPrice').value = p.price || '';
  document.getElementById('productStock').value = p.stock || '';
  document.getElementById('productCategory').value = p.category || '';
  document.getElementById('productImage').value = p.image_url || '';
  updateImagePreview();
}

export function hideProductForm() {
  document.getElementById('productForm').reset();
  document.getElementById('productForm').classList.add('d-none');
  updateImagePreview();
}

export function updateImagePreview() {
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

export function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('productId').value;
  const body = {
    name: document.getElementById('productName').value,
    description: document.getElementById('productDesc').value,
    price: document.getElementById('productPrice').value,
    stock: document.getElementById('productStock').value,
    category: document.getElementById('productCategory').value,
    image_url: document.getElementById('productImage').value
  };
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/api/products/${id}` : `${API_URL}/api/products`;
  fetch(url, { method, headers, body: JSON.stringify(body) })
    .then(() => {
      showToast('Product saved', 'success');
      hideProductForm();
      fetchProducts();
    });
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE', headers })
    .then(() => {
      showToast('Product deleted', 'success');
      fetchProducts();
    });
}
