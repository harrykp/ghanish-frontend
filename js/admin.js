const token = localStorage.getItem('token');
if (!token) {
  alert("Unauthorized");
  location.href = "login.html";
}

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

let allOrders = [];

function loadStats() {
  fetch(`${API_URL}/api/orders/all`, { headers })
    .then(r => r.json())
    .then(data => {
      const orders = data.orders || [];
      document.getElementById('statOrders').textContent = orders.length;
      document.getElementById('statPending').textContent = orders.filter(o => o.status === 'pending').length;
    });

  fetch(`${API_URL}/api/products`, { headers })
    .then(r => r.json())
    .then(data => {
      document.getElementById('statProducts').textContent = data.length;
    });
}


// === ORDERS ===
function fetchOrders() {
  fetch(`${API_URL}/api/orders/all`, { headers })
    .then(r => r.json())
    .then(data => {
      allOrders = data.orders || [];
      renderOrderTable(allOrders);
    });
}

function renderOrderTable(orders) {
  const list = document.getElementById('orderList');
  list.innerHTML = `
    <table class="table table-bordered">
      <thead><tr><th>ID</th><th>User</th><th>Total</th><th>Status</th><th>Change</th></tr></thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td>${o.id}</td>
            <td>
              <strong>${o.full_name || '—'}</strong><br/>
              <small>${o.phone || '–'}</small>
            </td>
            <td>USD ${parseFloat(o.total).toFixed(2)}</td>
            <td>${o.status}</td>
            <td>
              <button class="btn btn-sm btn-info me-2" onclick="viewOrderDetails(${o.id}, '${o.full_name}', '${o.phone}', '${o.status}', '${o.created_at}', ${o.total})">View</button>
              <select class="form-select mt-1" onchange="updateOrderStatus(${o.id}, this.value)">
                ${['pending','processing','shipped','delivered'].map(s =>
                  `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

function updateOrderStatus(id, status) {
  fetch(`${API_URL}/api/orders/${id}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status })
  }).then(() => {
    showToast('Status updated', 'success');
    fetchOrders();
  });
}

function exportOrdersToCSV() {
  const rows = [
    ['Order ID', 'Name', 'Phone', 'Total', 'Status', 'Created At'],
    ...allOrders.map(o => [
      o.id, o.full_name || '-', o.phone || '-', o.total, o.status, o.created_at
    ])
  ];
  const csv = rows.map(r => r.map(x => `"${x}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function printOrderModal() {
  const modalContent = document.querySelector('#orderModal .modal-content').innerHTML;
  const win = window.open('', '_blank', 'width=800,height=600');
  win.document.write(`
    <html><head><title>Print Order</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    </head><body>${modalContent}</body></html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 500);
}

document.getElementById('orderFilterInput')?.addEventListener('input', e => {
  const val = e.target.value.trim().toLowerCase();
  const filtered = allOrders.filter(o =>
    o.status.toLowerCase().includes(val) ||
    o.full_name?.toLowerCase().includes(val) ||
    o.phone?.toLowerCase().includes(val)
  );
  renderOrderTable(filtered);
});

// === PRODUCTS ===
function fetchProducts() {
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
                    ${p.image_url ? `<img src="${p.image_url}" alt="" style="height:40px;">` : ''}
                    <span>${p.name}</span>
                  </div>
                </td>
                <td>USD ${parseFloat(p.price).toFixed(2)}</td>
                <td>
                  <button class="btn btn-sm btn-warning me-1 edit-product-btn" data-product='${JSON.stringify(p)}'>Edit</button>
                  <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>`;
    });
}

function showProductForm(p = {}) {
  document.getElementById('productForm').classList.remove('d-none');
  document.getElementById('productId').value = p.id || '';
  document.getElementById('productName').value = p.name || '';
  document.getElementById('productDesc').value = p.description || '';
  document.getElementById('productPrice').value = p.price || '';
  document.getElementById('productStock').value = p.stock || '';
  document.getElementById('productCategory').value = p.category || '';
  document.getElementById('productImage').value = p.image_url || '';
  document.getElementById('productFormTitle').textContent = p.id ? 'Edit Product' : 'New Product';
  updateImagePreview();
}

function hideProductForm() {
  document.getElementById('productForm').reset();
  document.getElementById('productForm').classList.add('d-none');
  const preview = document.getElementById('imagePreview');
  preview.src = '';
  preview.classList.add('d-none');
}

function saveProduct(e) {
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
  if (!confirm('Are you sure?')) return;
  fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE', headers })
    .then(() => {
      showToast('Product deleted', 'success');
      fetchProducts();
    });
}

// === Image Preview ===
function updateImagePreview() {
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

// === Modal: Order Details ===
function viewOrderDetails(orderId, full_name, phone, status, createdAt, total) {
  document.getElementById('modalCustomerName').textContent = full_name || '–';
  document.getElementById('modalCustomerPhone').textContent = phone || '–';
  document.getElementById('modalOrderStatus').textContent = status;
  document.getElementById('modalOrderDate').textContent = new Date(createdAt).toLocaleString();
  document.getElementById('modalOrderTotal').textContent = `USD ${parseFloat(total).toFixed(2)}`;
  document.getElementById('modalViewProfileLink').href = `profile.html?user=${encodeURIComponent(full_name)}`;

  const body = document.getElementById('modalItemsBody');
  body.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

  fetch(`${API_URL}/api/orders/${orderId}/admin`, { headers })
    .then(r => r.json())
    .then(order => {
      if (!order.items || !order.items.length) {
        body.innerHTML = '<tr><td colspan="4">No items found</td></tr>';
        return;
      }
      body.innerHTML = order.items.map(item => `
        <tr>
          <td>${item.product_name}</td>
          <td>${item.quantity}</td>
          <td>USD ${parseFloat(item.unit_price).toFixed(2)}</td>
          <td>USD ${parseFloat(item.subtotal).toFixed(2)}</td>
        </tr>
      `).join('');
    })
    .catch(() => {
      body.innerHTML = '<tr><td colspan="4">Failed to load items</td></tr>';
    });

  new bootstrap.Modal(document.getElementById('orderModal')).show();
}

// === Revenue Analytics + Top Products Charts ===
function fetchRevenueAnalytics() {
  fetch(`${API_URL}/api/admin/revenue`, { headers })
    .then(r => r.json())
    .then(data => {
      const ctx = document.getElementById('revenueChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Monthly Revenue (USD)',
            data: data.values,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderRadius: 5
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    });

  // === Top Selling Products Chart ===
  fetch(`${API_URL}/api/admin/analytics`, { headers })
    .then(r => r.json())
    .then(data => {
      const ctx = document.getElementById('topProductsChart').getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.topProducts.labels,
          datasets: [{
            data: data.topProducts.values,
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    });
}
  // === Discounts ===
function fetchDiscountCodes() {
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
                <td><button class="btn btn-sm btn-danger" onclick="deleteDiscountCode(${d.id})">Delete</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      `;
    });
}

function showDiscountForm() {
  document.getElementById('discountForm').classList.remove('d-none');
}

function hideDiscountForm() {
  document.getElementById('discountForm').classList.add('d-none');
  document.getElementById('discountForm').reset();
}

function saveDiscountCode(e) {
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


// === Init ===
document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('#adminTabs .nav-link');
  if (tabButtons.length) {
    const tabTrigger = new bootstrap.Tab(tabButtons[0]);
    tabTrigger.show();
    tabButtons.forEach(btn => {
      btn.addEventListener('shown.bs.tab', e => {
        const target = e.target.getAttribute('href');
        if (target === '#orders') fetchOrders();
        if (target === '#products') fetchProducts();
        if (target === '#analytics') fetchRevenueAnalytics();
        if (target === '#discounts') fetchDiscountCodes();
      });
    });
    fetchOrders();
    loadStats();
  }

  document.addEventListener('click', e => {
    if (e.target.classList.contains('edit-product-btn')) {
      try {
        const productData = JSON.parse(e.target.dataset.product);
        showProductForm(productData);
      } catch (err) {
        showToast('Failed to load product data', 'danger');
      }
    }
  });
});
