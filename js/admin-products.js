// === Admin Products Page ===

document.addEventListener('DOMContentLoaded', () => {
  if (location.pathname === '/admin-products.html') {
    fetchProducts();
  }
});

window.fetchProducts = function () {
  fetch(`${API_URL}/api/products`, { headers })
    .then(r => r.json())
    .then(products => {
      const list = document.getElementById('productList');
      if (!list) return;
      list.innerHTML = products.map(p => `
        <div class="card mb-2">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <strong>${p.name}</strong><br/>
              <small>${p.category}</small><br/>
              <small>USD ${parseFloat(p.price).toFixed(2)}</small>
            </div>
            <div>
              <button class="btn btn-sm btn-outline-primary me-2" onclick="showProductForm(${p.id})">Edit</button>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})">Delete</button>
            </div>
          </div>
        </div>
      `).join('');
    });
};

window.saveProduct = function (e) {
  e.preventDefault();

  const id = document.getElementById('productId').value;
  const name = document.getElementById('productName').value;
  const description = document.getElementById('productDesc').value;
  const price = document.getElementById('productPrice').value;
  const stock = document.getElementById('productStock').value;
  const category = document.getElementById('productCategory').value;
  const image_url = document.getElementById('productImage').value;

  const payload = { name, description, price, stock, category, image_url };
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/api/products/${id}` : `${API_URL}/api/products`;

  fetch(url, {
    method,
    headers,
    body: JSON.stringify(payload)
  }).then(() => {
    hideProductForm();
    fetchProducts();
  });
};

window.showProductForm = function (id) {
  const form = document.getElementById('productForm');
  if (!form) return;
  form.reset();
  form.classList.remove('d-none');
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
  }
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

window.hideProductForm = function () {
  document.getElementById('productForm')?.classList.add('d-none');
};

window.deleteProduct = function (id) {
  if (!confirm('Delete this product?')) return;
  fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers
  }).then(() => fetchProducts());
};
