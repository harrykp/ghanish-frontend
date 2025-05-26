// public/js/admin/analytics.js

import { showLoading, showError } from './utils.js';
import { API_BASE, authHeaders } from './config.js';

let revenueChart, topProductsChart;

async function fetchRevenueAnalytics() {
  const container = document.getElementById('revenue-chart-container');
  showLoading(container);

  try {
    const res = await fetch(`${API_BASE}/api/admin/revenue`, {
      headers: authHeaders()
    });
    const data = await res.json();

    if (!data.labels || !data.values) {
      showError(container, data.message || 'Failed to load revenue data.');
      return;
    }

    renderRevenueChart(data.labels, data.values);
  } catch (err) {
    showError(container, 'Error loading revenue analytics.');
  }
}

function renderRevenueChart(labels, values) {
  const ctx = document.getElementById('revenue-chart').getContext('2d');
  if (revenueChart) revenueChart.destroy();

  revenueChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Revenue (GHS)',
        data: values,
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Revenue Over Time' }
      }
    }
  });
}

async function fetchTopProductsAnalytics() {
  const container = document.getElementById('top-products-chart-container');
  showLoading(container);

  try {
    const res = await fetch(`${API_BASE}/api/admin/top-products`, {
      headers: authHeaders()
    });
    const data = await res.json();

    if (!Array.isArray(data.products)) {
      showError(container, data.message || 'Failed to load top products.');
      return;
    }

    const labels = data.products.map(p => p.product_name);
    const values = data.products.map(p => p.total_sold);

    renderTopProductsChart(labels, values);
  } catch (err) {
    showError(container, 'Error loading top products data.');
  }
}

function renderTopProductsChart(labels, values) {
  const ctx = document.getElementById('top-products-chart').getContext('2d');
  if (topProductsChart) topProductsChart.destroy();

  topProductsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        label: 'Top Selling Products',
        data: values,
        backgroundColor: [
          '#4dc9f6', '#f67019', '#f53794',
          '#537bc4', '#acc236', '#166a8f',
          '#00a950', '#58595b', '#8549ba'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Top Selling Products' },
        legend: { position: 'bottom' }
      }
    }
  });
}

export function initAnalyticsModule() {
  fetchRevenueAnalytics();
  fetchTopProductsAnalytics();
}
