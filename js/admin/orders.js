// public/js/admin/orders.js

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

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log('Orders data:', data);

    if (!Array.isArray(data.orders)) {
      showError(container, data.message || 'Failed to load orders.');
      return;
    }

    renderOrders(data.orders);
    renderPagination(data.totalPages || 1, data.currentPage || 1);
  } catch (err) {
    console.error('❌ Error loading orders:', err);
    showError(container, 'Error loading orders.');
  }
}

function renderOrders(orders) {
  const container = document.getElementById('orders-container');
  if (!orders.length) {
    container.innerHTML = '<p>No orders found.</p>';
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="order-card">
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Customer:</strong> ${order.full_name}</p>
      <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <button class="btn btn-primary view-order" data-id="${order.id}">View</button>
    </div>
  `).join('');
}

function renderPagination(totalPages, current) {
  const nav = document.getElementById('orders-pagination');
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === current ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  nav.innerHTML = html;
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
  } catch {
    showToast('error', 'Error loading order details.');
  }
}

function showOrderModal(order) {
  const modal = document.getElementById('order-details-modal');
  const content = modal.querySelector('.modal-body');
  content.innerHTML = `
    <h4>Order #${order.id}</h4>
    <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
    <p><strong>Status:</strong> ${order.status}</p>
    <p><strong>Date:</strong> ${formatDate(order.created_at)}</p>
    <h5>Items:</h5>
    <ul>${order.items.map(item => `<li>${item.product_name} x ${item.quantity}</li>`).join('')}</ul>
  `;
  modal.classList.add('show');
  modal.style.display = 'block';
}

function hideOrderModal() {
  const modal = document.getElementById('order-details-modal');
  modal.classList.remove('show');
  modal.style.display = 'none';
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

  delegate(document, '.modal .close', () => hideOrderModal());
}

export function initOrdersModule() {
  fetchOrders(currentPage);
  attachEventListeners();
}
