let allDiscounts = [];
let filteredDiscounts = [];
let currentDiscountPage = 1;
const discountsPerPage = 10;

document.addEventListener('DOMContentLoaded', () => {
  if (location.pathname === '/admin-discounts.html') {
    fetchDiscountCodes();

    const searchInput = document.getElementById('discountSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        filteredDiscounts = allDiscounts.filter(d =>
          d.code.toLowerCase().includes(query)
        );
        renderDiscountTable(currentDiscountPage);
      });
    }
  }
});

window.fetchDiscountCodes = function () {
  fetch(`${API_URL}/api/discounts`, { headers })
    .then(r => r.json())
    .then(discounts => {
      allDiscounts = discounts || [];
      filteredDiscounts = allDiscounts;
      renderDiscountTable(1);
    });
};

function renderDiscountTable(page) {
  currentDiscountPage = page;
  const start = (page - 1) * discountsPerPage;
  const end = start + discountsPerPage;
  const items = filteredDiscounts.slice(start, end);

  const list = document.getElementById('discountList');
  if (!list) return;

  list.innerHTML = `
    <table class="table table-bordered">
      <thead><tr><th>Code</th><th>% Off</th><th>Expires At</th><th>Actions</th></tr></thead>
      <tbody>
        ${items.map(d => `
          <tr>
            <td>${d.code}</td>
            <td>${d.percent_off}%</td>
            <td>${d.expires_at ? new Date(d.expires_at).toLocaleString() : '—'}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary me-2" onclick="showDiscountForm(${d.id})">Edit</button>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteDiscountCode(${d.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  renderPagination('discountPagination', filteredDiscounts.length, discountsPerPage, currentDiscountPage, renderDiscountTable);
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

window.exportDiscountsToCSV = function () {
  if (!filteredDiscounts.length) {
    showToast('No discount codes to export.', 'warning');
    return;
  }

  const rows = [
    ['Code', '% Off', 'Expires At'],
    ...filteredDiscounts.map(d => [
      d.code,
      d.percent_off,
      d.expires_at ? new Date(d.expires_at).toLocaleString() : ''
    ])
  ];

  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `discounts-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

window.showDiscountForm = function (id) {
  const form = document.getElementById('discountForm');
  form.reset();
  form.classList.remove('d-none');
  form.dataset.editingId = '';

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
  }
};

window.hideDiscountForm = function () {
  document.getElementById('discountForm')?.classList.add('d-none');
};

window.saveDiscountCode = function (e) {
  e.preventDefault();
  const code = document.getElementById('discountCode').value;
  const percent_off = document.getElementById('discountPercent').value;
  const expires_at = document.getElementById('discountExpires').value || null;
  const id = document.getElementById('discountForm').dataset.editingId;

  const payload = { code, percent_off, expires_at };
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/api/discounts/${id}` : `${API_URL}/api/discounts`;

  fetch(url, {
    method,
    headers,
    body: JSON.stringify(payload)
  }).then(() => {
    hideDiscountForm();
    fetchDiscountCodes();
  });
};

window.deleteDiscountCode = function (id) {
  if (!confirm('Delete this discount code?')) return;
  fetch(`${API_URL}/api/discounts/${id}`, {
    method: 'DELETE',
    headers
  }).then(() => fetchDiscountCodes());
};
