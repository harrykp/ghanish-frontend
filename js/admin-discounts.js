// === Admin Discounts Page ===

document.addEventListener('DOMContentLoaded', () => {
  if (location.pathname === '/admin-discounts.html') {
    fetchDiscountCodes();
  }
});

window.fetchDiscountCodes = function () {
  fetch(`${API_URL}/api/discounts`, { headers })
    .then(r => r.json())
    .then(discounts => {
      const list = document.getElementById('discountList');
      if (!list) return;
      list.innerHTML = discounts.map(d => `
        <div class="card mb-2">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <strong>${d.code}</strong><br/>
              <small>${d.percent_off}% off</small><br/>
              <small>Expires: ${d.expires_at ? new Date(d.expires_at).toLocaleString() : '—'}</small>
            </div>
            <div>
              <button class="btn btn-sm btn-outline-primary me-2" onclick="showDiscountForm(${d.id})">Edit</button>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteDiscountCode(${d.id})">Delete</button>
            </div>
          </div>
        </div>
      `).join('');
    });
};

window.saveDiscountCode = function (e) {
  e.preventDefault();

  const code = document.getElementById('discountCode').value;
  const percent_off = document.getElementById('discountPercent').value;
  const expires_at = document.getElementById('discountExpires').value;
  const id = document.getElementById('discountForm').dataset.editingId;

  const payload = { code, percent_off, expires_at: expires_at || null };
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/api/discounts/${id}` : `${API_URL}/api/discounts`;

  fetch(url, {
    method,
    headers,
    body: JSON.stringify(payload)
  }).then(() => {
    document.getElementById('discountForm').dataset.editingId = '';
    hideDiscountForm();
    fetchDiscountCodes();
  });
};

window.showDiscountForm = function (id) {
  const form = document.getElementById('discountForm');
  form.reset();
  form.classList.remove('d-none');

  if (typeof id === 'number') {
    fetch(`${API_URL}/api/discounts`, { headers })
      .then(r => r.json())
      .then(discounts => {
        const discount = discounts.find(d => d.id === id);
        if (!discount) return;
        document.getElementById('discountCode').value = discount.code;
        document.getElementById('discountPercent').value = discount.percent_off;
        document.getElementById('discountExpires').value = discount.expires_at?.slice(0, 16) || '';
        form.dataset.editingId = id;
      });
  } else {
    form.dataset.editingId = '';
  }
};

window.hideDiscountForm = function () {
  document.getElementById('discountForm')?.classList.add('d-none');
};

window.deleteDiscountCode = function (id) {
  if (!confirm('Delete this discount code?')) return;
  fetch(`${API_URL}/api/discounts/${id}`, {
    method: 'DELETE',
    headers
  }).then(() => fetchDiscountCodes());
};
