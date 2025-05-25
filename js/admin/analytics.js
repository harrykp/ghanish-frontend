// analytics.js
import { API_URL, headers } from './utils.js';

export function fetchRevenueAnalytics() {
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
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
      });
    });

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
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
          }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
      });
    });
}
