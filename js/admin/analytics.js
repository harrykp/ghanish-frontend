// public/js/admin/analytics.js

import { showLoading, showError, showToast } from './utils.js';

let revenueChart, topProductsChart;

async function fetchRevenueAnalytics() {
  const container = document.getElementById('revenue-chart-container');
  showLoading(container);

  try {
    const res = await fetch('/api/admin/revenue');
    const data = await res.json();

    if (!data.success) {
      showError(container, data.message || 'Failed to load revenue analytics.');
      return;
    }

    renderRevenueChart(data.revenue);
  } catch (err) {
    showError(container, 'Error loading revenue data.');
  }
}

function renderRevenueChart(revenueData) {
  const ctx = document.getElementById('revenue-chart').getContext('2d');
  if (revenueChart) revenueChart.destroy();

  const labels = revenueData.map(item => item.date);
  const values = revenueData.map(item => item.total);

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
    const res = await fetch('/api/admin/top-products');
    const data = await res.json();

    if (!data.success) {
      showError(container, data.message || 'Failed to load top products data.');
      return;
    }

    renderTopProductsChart(data.products);
  } catch (err) {
    showError(container, 'Error loading top products.');
  }
}

function renderTopProductsChart(productsData) {
  const ctx = document.getElementById('top-products-chart').getContext('2d');
  if (topProductsChart) topProductsChart.destroy();

  const labels = productsData.map(p => p.product_name);
  const values = productsData.map(p => p.total_sold);

  topProductsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        label: 'Top Selling Products',
        data: values,
        backgroundColor: [
          '#4dc9f6',
          '#f67019',
          '#f53794',
          '#537bc4',
          '#acc236',
          '#166a8f',
          '#00a950',
          '#58595b',
          '#8549ba'
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
