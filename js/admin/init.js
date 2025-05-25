// init.js
import { fetchOrders } from './orders.js';
import { fetchProducts } from './products.js';
import { fetchUsers } from './users.js';
import { fetchDiscountCodes } from './discounts.js';
import { fetchRevenueAnalytics } from './analytics.js';
import { loadDashboardStats } from './dashboard.js';

document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('#adminTabs .nav-link');
  if (tabButtons.length) {
    const tabTrigger = new bootstrap.Tab(tabButtons[0]);
    tabTrigger.show();

    tabButtons.forEach(btn => {
      btn.addEventListener('shown.bs.tab', e => {
        const target = e.target.getAttribute('href');
        if (target === '#orders') fetchOrders();
        if (target === '#products') fetchProducts();
        if (target === '#users') fetchUsers();
        if (target === '#discounts') fetchDiscountCodes();
        if (target === '#analytics') fetchRevenueAnalytics();
      });
    });

    fetchOrders();
    loadDashboardStats();
  }
});
