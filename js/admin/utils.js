// public/js/admin/utils.js

/**
 * Display a loading spinner inside a given container
 * @param {HTMLElement} container
 */
export function showLoading(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
    </div>
  `;
}

/**
 * Display an error message inside a given container
 * @param {HTMLElement} container
 * @param {string} message
 */
export function showError(container, message = 'An error occurred.') {
  if (!container) return;
  container.innerHTML = `
    <div class="alert alert-danger">${message}</div>
  `;
}

/**
 * Format date to readable string
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return isNaN(date) ? '' : date.toLocaleString();
}

/**
 * Format price to currency
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return `GHS ${Number(amount).toFixed(2)}`;
}

/**
 * Show a toast notification
 * @param {'success' | 'error'} type
 * @param {string} message
 */
export function showToast(type, message) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * Attach click event delegation for dynamic elements
 * @param {Element} container
 * @param {string} selector
 * @param {(e: Event) => void} callback
 */
export function delegate(container, selector, callback) {
  if (!container) return;
  container.addEventListener('click', (e) => {
    const target = e.target.closest(selector);
    if (target) callback(e, target);
  });
}
