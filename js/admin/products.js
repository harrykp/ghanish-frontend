// public/js/admin/products.js

import {
  showLoading,
  showError,
  showToast,
  delegate
} from './utils.js';
import { API_BASE, authHeaders } from './config.js';

async function fetchProducts() {
  const container = document.getElementById('products-container');
  showLoading(container);

  try {
    const res = await fetch(`${API_BASE}/api/products`, {
      headers: authHeaders()
    });
    const data = await res.json();

    if (!Array.isArray(data)) {
      showError(container, data.message || 'Failed to load products.');
      return;
    }

    renderProducts(data);
  } catch (err) {
    showError(container, 'Error loading products.');
  }
}

async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const res = await fetch(`${API_BASE}/api/products/${productId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });

    const data = await res.json();

    if (data.success || data.message) {
      showToast('success', 'Product deleted.');
      fetchProducts();
    } else {
      showToast('error', data.error || 'Failed to delete product.');
    }
  } catch (err) {
    showToast('error', 'Error deleting product.');
  }
}

async function fetchProductById(productId) {
  try {
    const res = await fetch(`${API_BASE}/api/products`, {
      headers: authHeaders()
    });
    const allProducts = await res.json();
    const product = allProducts.find(p => p.id === parseInt(productId));
    if (product) {
      populateEditForm(product);
    } else {
      showToast('error', 'Product not found.');
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
  const url = id ? `${API_BASE}/api/products/${id}` : `${API_BASE}/api/products`;

  try {
    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success || data.id) {
      showToast('success', `Product ${id ? 'updated' : 'created'} successfully.`);
      form.reset();
      fetchProducts();
    } else {
      showToast('error', data.error || 'Failed to save product.');
    }
  } catch (err) {
    showToast('error', 'Error saving product.');
  }
}

// attachEventListeners() and renderProducts() remain unchanged

export function initProductsModule() {
  fetchProducts();
  attachEventListeners();
}
