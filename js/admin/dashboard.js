// public/js/admin/dashboard.js

import {
  showLoading,
  showError,
  formatCurrency,
} from './utils.js';

async function fetchDashboardStats() {
  const container = document.getElementById('dashboard-stats');
  showLoading(container);

  try {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();

    if (!data.success) {
      showError(container, data.message || 'Failed to load dashboard stats.');
      return;
    }

    renderDashboardStats(data.stats);
  } catch (err) {
    showError(container, 'Error fetching dashboard stats.');
  }
}

function renderDashboardStats(stats) {
  const container = document.getElementById('dashboard-stats');
  if (!container) return;

  container.innerHTML = `
    <div class="stat-card">
      <h4>Total Orders</h4>
      <p>${stats.totalOrders}</p>
    </div>
    <div class="stat-card">
      <h4>Total Revenue</h4>
      <p>${formatCurrency(stats.totalRevenue)}</p>
    </div>
    <div class="stat-card">
      <h4>Total Users</h4>
      <p>${stats.totalUsers}</p>
    </div>
    <div class="stat-card">
      <h4>Active Discounts</h4>
      <p>${stats.activeDiscounts}</p>
    </div>
  `;
}

export function initDashboardModule() {
  fetchDashboardStats();
}
