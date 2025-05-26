// public/js/admin/analytics.js

import { showLoading, showError } from './utils.js';
import { API_BASE, authHeaders } from './config.js';

let revenueChart, topProductsChart;

async function fetchAnalytics() {
  const revenueContainer = document.getElementById('revenue-chart-container');
  const productsContainer = document.getElementById('top-products-chart-container');

  showLoading(revenueContainer);
  showLoading(productsContainer);

  try {
    const res = await fetch(`${API_BASE}/api/admin/analytics`, {
      headers: authHeaders()
    });
    const data = await res.json();

    if (!data.topProducts || !data.orderTrends) {
      showError(revenueContainer, 'Failed to load revenue analytics.');
      showError(productsContainer, 'Failed to load top products.');
      return;
    }

    renderRevenueChart(data.orderTrends.labels, data.orderTrends.values);
    renderTopProductsChart(data.topProducts.labels, data.topProducts.values);
  } catch (err) {
    showError(revenueContainer, 'Error loading revenue analytics.');
    showError(productsContainer, 'Error loading top products data.');
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
        label: 'Orders per Month',
        data: values,
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Order Trends' }
      }
    }
  });
}

function renderTopProductsChart(labels, values) {
  const ctx = document.getElementById('top-products-chart').getContext('2d');
  if (topProductsChart) topProductsChart.destroy();

  topProductsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        label: 'Top Products',
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
  fetchAnalytics();
}
