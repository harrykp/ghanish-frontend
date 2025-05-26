import {
  showLoading,
  showError,
  formatCurrency,
  formatDate,
  delegate,
  showToast
} from './utils.js';
import { API_BASE, authHeaders } from './config.js';

let currentPage = 1;
const ordersPerPage = 10;

async function fetchOrders(page = 1) {
  const container = document.getElementById('orders-container');
  showLoading(container);

  try {
    const res = await fetch(`${API_BASE}/api/orders/all?page=${page}&limit=${ordersPerPage}`, {
      headers: authHeaders()
    });
    const data = await res.json();

    if (!data.success && !Array.isArray(data.orders)) {
      showError(container, data.message || 'Failed to load orders.');
      return;
    }

    renderOrders(data.orders);
    renderPagination(data.totalPages || 1, data.currentPage || 1);
  } catch (err) {
    showError(container, 'Error loading orders.');
  }
}

async function fetchOrderDetails(orderId) {
  try {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/admin`, {
      headers: authHeaders()
    });
    const data = await res.json();

    if (data.id) {
      showOrderModal(data);
    } else {
      showToast('error', 'Failed to load order details.');
    }
  } catch (err) {
    showToast('error', 'Error loading order details.');
  }
}

function attachEventListeners() {
  delegate(document, '.view-order', (e, target) => {
    const orderId = target.getAttribute('data-id');
    if (orderId) fetchOrderDetails(orderId);
  });

  delegate(document, '#orders-pagination', (e, target) => {
    const page = parseInt(target.getAttribute('data-page'));
    if (!isNaN(page)) {
      currentPage = page;
      fetchOrders(currentPage);
    }
  });

  delegate(document, '.modal .close', () => {
    hideOrderModal();
  });
}

export function initOrdersModule() {
  fetchOrders(currentPage);
  attachEventListeners();
}
