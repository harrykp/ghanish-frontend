// public/js/admin/products.js

import {
  showLoading,
  showError,
  showToast,
  delegate
} from './utils.js';

async function fetchProducts() {
  const container = document.getElementById('products-container');
  showLoading(container);

  try {
    const res = await fetch('/api/products');
    const data = await res.json();

    if (!data.success) {
      showError(container, data.message || 'Failed to load products.');
      return;
    }

    renderProducts(data.products);
  } catch (err) {
    showError(container, 'Error loading products.');
  }
}

function renderProducts(products) {
  const container = document.getElementById('products-container');
  if (!container) return;

  if (!products.length) {
    container.innerHTML = '<p>No products available.</p>';
    return;
  }

  const html = products.map(product => `
    <div class="product-card">
      <p><strong>${product.name}</strong></p>
      <p>Price: GHS ${Number(product.price).toFixed(2)}</p>
      <p>Category: ${product.category || 'Uncategorized'}</p>
      <button class="btn btn-sm btn-warning edit-product" data-id="${product.id}">Edit</button>
      <button class="btn btn-sm btn-danger delete-product" data-id="${product.id}">Delete</button>
    </div>
  `).join('');

  container.innerHTML = html;
}

async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (data.success) {
      showToast('success', 'Product deleted.');
      fetchProducts();
    } else {
      showToast('error', data.message || 'Failed to delete product.');
    }
  } catch (err) {
    showToast('error', 'Error deleting product.');
  }
}

function populateEditForm(product) {
  const form = document.getElementById('product-form');
  form['product-id'].value = product.id;
  form['product-name'].value = product.name;
  form['product-price'].value = product.price;
  form['product-category'].value = product.category || '';
}

async function fetchProductById(productId) {
  try {
    const res = await fetch(`/api/products/${productId}`);
    const data = await res.json();

    if (data.success) {
      populateEditForm(data.product);
    } else {
      showToast('error', 'Failed to load product data.');
    }
  } catch (err) {
    showToast('error', 'Error fetching product.');
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const id = form['product-id'].value;
  const name = form['product-name'].value;
  const price = form['product-price'].value;
  const category = form['product-category'].value;

  const payload = { name, price, category };
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/products/${id}` : '/api/products';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      showToast('success', `Product ${id ? 'updated' : 'created'} successfully.`);
      form.reset();
      fetchProducts();
    } else {
      showToast('error', data.message || 'Failed to save product.');
    }
  } catch (err) {
    showToast('error', 'Error saving product.');
  }
}

function attachEventListeners() {
  const form = document.getElementById('product-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  delegate(document, '.edit-product', (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) fetchProductById(id);
  });

  delegate(document, '.delete-product', (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) deleteProduct(id);
  });
}

export function initProductsModule() {
  fetchProducts();
  attachEventListeners();
}
