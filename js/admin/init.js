import { fetchOrders, setupOrderEvents } from './orders.js';
import { fetchProducts, setupProductEvents } from './products.js';
import { fetchRevenueAnalytics } from './analytics.js';
import { fetchDiscountCodes, setupDiscountEvents } from './discounts.js';
import { fetchUsers, setupUserEvents } from './users.js';
import { setupCommonUI } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  setupCommonUI();
  fetchOrders();
  fetchProducts();
  fetchRevenueAnalytics();
  fetchDiscountCodes();
  fetchUsers();

  setupOrderEvents();
  setupProductEvents();
  setupDiscountEvents();
  setupUserEvents();

  const tabButtons = document.querySelectorAll('#adminTabs .nav-link');
  tabButtons.forEach(btn => {
    btn.addEventListener('shown.bs.tab', e => {
      const target = e.target.getAttribute('href');
      if (target === '#orders') fetchOrders();
      if (target === '#products') fetchProducts();
      if (target === '#analytics') fetchRevenueAnalytics();
      if (target === '#discounts') fetchDiscountCodes();
      if (target === '#users') fetchUsers();
    });
  });
});
