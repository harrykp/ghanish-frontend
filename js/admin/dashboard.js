// public/js/admin/dashboard.js

import {
  showLoading,
  showError,
  formatCurrency
} from './utils.js';
import { API_BASE, authHeaders } from './config.js';

async function fetchDashboardStats() {
  const container = document.getElementById('dashboard-stats');
  showLoading(container);

  try {
    const res = await fetch(`${API_BASE}/api/admin/stats`, {
      headers: authHeaders()
    });
    const data = await res.json();

    if (!data.stats) {
      showError(container, data.message || 'Failed to load dashboard stats.');
      return;
    }

    renderStats(data.stats);
  } catch (err) {
    showError(container, 'Error loading dashboard stats.');
  }
}

function renderStats(stats) {
  const container = document.getElementById('dashboard-stats');
  if (!container) return;

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-box">
        <h4>Total Orders</h4>
        <p>${stats.totalOrders}</p>
      </div>
      <div class="stat-box">
        <h4>Total Revenue</h4>
        <p>${formatCurrency(stats.totalRevenue)}</p>
      </div>
      <div class="stat-box">
        <h4>Users</h4>
        <p>${stats.totalUsers}</p>
      </div>
      <div class="stat-box">
        <h4>Products</h4>
        <p>${stats.totalProducts}</p>
      </div>
    </div>
  `;
}

export function initDashboardModule() {
  fetchDashboardStats();
}
