// public/js/admin/discounts.js

import {
  showLoading,
  showError,
  showToast,
  delegate
} from './utils.js';
import { API_BASE, authHeaders } from './config.js';

async function fetchDiscountCodes() {
  const container = document.getElementById('discounts-container');
  showLoading(container);

  try {
    const res = await fetch(`${API_BASE}/api/discounts`, {
      headers: authHeaders()
    });
    const data = await res.json();

    if (!Array.isArray(data)) {
      showError(container, data.message || 'Failed to load discount codes.');
      return;
    }

    renderDiscounts(data);
  } catch (err) {
    showError(container, 'Error loading discount codes.');
  }
}

async function deleteDiscount(discountId) {
  if (!confirm('Delete this discount code?')) return;

  try {
    const res = await fetch(`${API_BASE}/api/discounts/${discountId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });

    const data = await res.json();

    if (data.message) {
      showToast('success', 'Discount deleted.');
      fetchDiscountCodes();
    } else {
      showToast('error', data.error || 'Failed to delete discount.');
    }
  } catch (err) {
    showToast('error', 'Error deleting discount.');
  }
}

async function fetchDiscountById(discountId) {
  try {
    const res = await fetch(`${API_BASE}/api/discounts`, {
      headers: authHeaders()
    });
    const all = await res.json();
    const discount = all.find(d => d.id === parseInt(discountId));
    if (discount) {
      populateEditForm(discount);
    } else {
      showToast('error', 'Discount not found.');
    }
  } catch (err) {
    showToast('error', 'Error fetching discount.');
  }
}

async function handleDiscountFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const id = form['discount-id'].value;
  const code = form['code'].value;
  const percent_off = form['value'].value;
  const expiry_date = form['expiry-date'].value;

  const payload = { code, percent_off, expires_at: expiry_date || null };
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_BASE}/api/discounts/${id}` : `${API_BASE}/api/discounts`;

  try {
    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.message || data.id) {
      showToast('success', `Discount ${id ? 'updated' : 'created'} successfully.`);
      form.reset();
      fetchDiscountCodes();
    } else {
      showToast('error', data.error || 'Failed to save discount.');
    }
  } catch (err) {
    showToast('error', 'Error saving discount.');
  }
}

export function initDiscountsModule() {
  fetchDiscountCodes();
  attachEventListeners();
}
