// === Toast Notification ===
window.showToast = function(message, type = 'info') {
  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center text-bg-${type} border-0 position-fixed bottom-0 end-0 m-3`;
  toastEl.setAttribute('role', 'alert');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  document.body.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
};

// === Currency Formatter ===
window.formatCurrency = function(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

// === Confirm Delete ===
window.confirmDelete = function(message, callback) {
  if (confirm(message)) callback();
};

// === Date Formatter ===
window.formatDate = function(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
    hour12: true
  });
};

// === Loading Overlay ===
window.showLoader = function() {
  if (document.getElementById('globalLoader')) return;
  const overlay = document.createElement('div');
  overlay.id = 'globalLoader';
  overlay.style = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 2000; display: flex; align-items: center; justify-content: center;
  `;
  overlay.innerHTML = `
    <div class="spinner-border text-light" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  `;
  document.body.appendChild(overlay);
};

window.hideLoader = function() {
  const loader = document.getElementById('globalLoader');
  if (loader) loader.remove();
};

// === Copy to Clipboard ===
window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard', 'success');
  }).catch(() => {
    showToast('Failed to copy', 'danger');
  });
// === Admin Page Guard ===
window.requireAdmin = function () {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.role;

    if (role !== 'admin') {
      window.location.href = '/index.html';
    }
  } catch (err) {
    console.error('Invalid token. Redirecting to login.');
    window.location.href = '/login.html';
  }
};

};
