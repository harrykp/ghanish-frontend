// public/js/admin/discounts.js

import {
  showLoading,
  showError,
  showToast,
  delegate
} from './utils.js';

async function fetchDiscountCodes() {
  const container = document.getElementById('discounts-container');
  showLoading(container);

  try {
    const res = await fetch('/api/discounts');
    const data = await res.json();

    if (!data.success) {
      showError(container, data.message || 'Failed to load discount codes.');
      return;
    }

    renderDiscounts(data.discounts);
  } catch (err) {
    showError(container, 'Error loading discount codes.');
  }
}

function renderDiscounts(discounts) {
  const container = document.getElementById('discounts-container');
  if (!container) return;

  if (!discounts.length) {
    container.innerHTML = '<p>No discount codes available.</p>';
    return;
  }

  const html = discounts.map(discount => `
    <div class="discount-card">
      <p><strong>Code:</strong> ${discount.code}</p>
      <p>Type: ${discount.type}</p>
      <p>Value: ${discount.value}${discount.type === 'percent' ? '%' : ' GHS'}</p>
      <p>Expires: ${discount.expiry_date ? new Date(discount.expiry_date).toLocaleDateString() : 'N/A'}</p>
      <button class="btn btn-sm btn-warning edit-discount" data-id="${discount.id}">Edit</button>
      <button class="btn btn-sm btn-danger delete-discount" data-id="${discount.id}">Delete</button>
    </div>
  `).join('');

  container.innerHTML = html;
}

async function deleteDiscount(discountId) {
  if (!confirm('Delete this discount code?')) return;

  try {
    const res = await fetch(`/api/discounts/${discountId}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (data.success) {
      showToast('success', 'Discount deleted.');
      fetchDiscountCodes();
    } else {
      showToast('error', data.message || 'Failed to delete discount.');
    }
  } catch (err) {
    showToast('error', 'Error deleting discount.');
  }
}

async function fetchDiscountById(discountId) {
  try {
    const res = await fetch(`/api/discounts/${discountId}`);
    const data = await res.json();

    if (data.success) {
      populateEditForm(data.discount);
    } else {
      showToast('error', 'Failed to fetch discount.');
    }
  } catch (err) {
    showToast('error', 'Error fetching discount.');
  }
}

function populateEditForm(discount) {
  const form = document.getElementById('discount-form');
  form['discount-id'].value = discount.id;
  form['code'].value = discount.code;
  form['type'].value = discount.type;
  form['value'].value = discount.value;
  form['expiry-date'].value = discount.expiry_date ? discount.expiry_date.split('T')[0] : '';
}

async function handleDiscountFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const id = form['discount-id'].value;
  const code = form['code'].value;
  const type = form['type'].value;
  const value = form['value'].value;
  const expiry_date = form['expiry-date'].value;

  const payload = { code, type, value, expiry_date };
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/discounts/${id}` : '/api/discounts';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      showToast('success', `Discount ${id ? 'updated' : 'created'} successfully.`);
      form.reset();
      fetchDiscountCodes();
    } else {
      showToast('error', data.message || 'Failed to save discount.');
    }
  } catch (err) {
    showToast('error', 'Error saving discount.');
  }
}

function attachEventListeners() {
  const form = document.getElementById('discount-form');
  if (form) {
    form.addEventListener('submit', handleDiscountFormSubmit);
  }

  delegate(document, '.edit-discount', (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) fetchDiscountById(id);
  });

  delegate(document, '.delete-discount', (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) deleteDiscount(id);
  });
}

export function initDiscountsModule() {
  fetchDiscountCodes();
  attachEventListeners();
}
