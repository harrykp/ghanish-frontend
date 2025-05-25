// discounts.js
import { API_URL, headers, showToast } from './utils.js';

export function fetchDiscountCodes() {
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
                <td><button class="btn btn-sm btn-danger" data-delete-id="${d.id}">Delete</button></td>
              </tr>`).join('')}
          </tbody>
        </table>`;
      list.querySelectorAll('[data-delete-id]').forEach(btn =>
        btn.addEventListener('click', () => deleteDiscountCode(btn.dataset.deleteId)));
    });
}

export function showDiscountForm() {
  document.getElementById('discountForm').classList.remove('d-none');
}

export function hideDiscountForm() {
  document.getElementById('discountForm').classList.add('d-none');
  document.getElementById('discountForm').reset();
}

export function saveDiscountCode(e) {
  e.preventDefault();
  const body = {
    code: document.getElementById('discountCode').value,
    percent_off: document.getElementById('discountPercent').value,
    expires_at: document.getElementById('discountExpires').value || null
  };
  fetch(`${API_URL}/api/discounts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  }).then(res => {
    if (res.ok) {
      showToast('Discount code added', 'success');
      hideDiscountForm();
      fetchDiscountCodes();
    } else {
      showToast('Failed to add code', 'danger');
    }
  });
}

function deleteDiscountCode(id) {
  if (!confirm('Delete this code?')) return;
  fetch(`${API_URL}/api/discounts/${id}`, {
    method: 'DELETE',
    headers
  }).then(() => {
    showToast('Code deleted', 'success');
    fetchDiscountCodes();
  });
}
