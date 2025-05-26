// === Admin Analytics Page ===

document.addEventListener('DOMContentLoaded', () => {
  if (location.pathname === '/admin-analytics.html') {
    fetchRevenueAnalytics();
  }
});

window.fetchRevenueAnalytics = function () {
  fetch(`${API_URL}/api/admin/analytics`, { headers })
    .then(r => r.json())
    .then(data => {
      const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
      const topProductsCtx = document.getElementById('topProductsChart')?.getContext('2d');

      if (revenueCtx) {
        new Chart(revenueCtx, {
          type: 'bar',
          data: {
            labels: data.orderTrends.labels,
            datasets: [{
              label: 'Orders per Month',
              data: data.orderTrends.values,
              backgroundColor: 'rgba(54, 162, 235, 0.6)'
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Monthly Revenue' }
            }
          }
        });
      }

      if (topProductsCtx) {
        new Chart(topProductsCtx, {
          type: 'doughnut',
          data: {
            labels: data.topProducts.labels,
            datasets: [{
              label: 'Top Products',
              data: data.topProducts.values,
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
              legend: { position: 'bottom' },
              title: { display: true, text: 'Top Selling Products' }
            }
          }
        });
      }
    });
};
