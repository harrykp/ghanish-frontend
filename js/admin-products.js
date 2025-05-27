let allProducts = [];
let filteredProducts = [];
let currentProductPage = 1;
const productsPerPage = 10;

document.addEventListener('DOMContentLoaded', () => {
  if (location.pathname === '/admin-products.html') {
    fetchProducts();

    const searchInput = document.getElementById('productSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        filteredProducts = allProducts.filter(p =>
          (p.name + p.category).toLowerCase().includes(query)
        );
        renderProductTable(currentProductPage);
      });
    }
  }
});

window.fetchProducts = function () {
  fetch(`${API_URL}/api/products`, { headers })
    .then(r => r.json())
    .then(products => {
      allProducts = products || [];
      filteredProducts = allProducts;
      renderProductTable(1);
    });
};

function renderProductTable(page) {
  currentProductPage = page;
  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  const pageItems = filteredProducts.slice(start, end);

  const list = document.getElementById('productList');
  if (!list) return;

  list.innerHTML = `
    <table class="table table-bordered">
      <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
      <tbody>
        ${pageItems.map(p => `
          <tr>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>USD ${parseFloat(p.price).toFixed(2)}</td>
            <td>${p.stock}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary me-2" onclick="showProductForm(${p.id})">Edit</button>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  renderPagination('productPagination', filteredProducts.length, productsPerPage, currentProductPage, renderProductTable);
}

function renderPagination(containerId, totalItems, perPage, currentPage, onPageChange) {
  const totalPages = Math.ceil(totalItems / perPage);
  const pagination = document.getElementById(containerId);
  if (!pagination) return;

  let html = '';
  html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
    <a class="page-link" href="#" onclick="${onPageChange.name}(${currentPage - 1})">Previous</a>
  </li>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
      <a class="page-link" href="#" onclick="${onPageChange.name}(${i})">${i}</a>
    </li>`;
  }

  html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
    <a class="page-link" href="#" onclick="${onPageChange.name}(${currentPage + 1})">Next</a>
  </li>`;

  pagination.innerHTML = html;
}

window.exportProductsToCSV = function () {
  if (!filteredProducts.length) {
    showToast('No products to export.', 'warning');
    return;
  }

  const rows = [
    ['Name', 'Category', 'Price', 'Stock'],
    ...filteredProducts.map(p => [
      p.name,
      p.category,
      parseFloat(p.price).toFixed(2),
      p.stock
    ])
  ];

  const csv = rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `products-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

window.showProductForm = function (id) {
  const form = document.getElementById('productForm');
  if (!form) return;
  form.reset();
  document.getElementById('productFormTitle').textContent = id ? 'Edit Product' : 'New Product';
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
