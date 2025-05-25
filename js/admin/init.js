// init.js
import { fetchOrders } from './orders.js';
import { fetchProducts, showProductForm, saveProduct, hideProductForm, updateImagePreview } from './products.js';
import { fetchUsers, showUserForm, saveUser, hideUserForm } from './users.js';
import { fetchDiscountCodes, showDiscountForm, saveDiscountCode, hideDiscountForm } from './discounts.js';
import { fetchRevenueAnalytics } from './analytics.js';
import { loadStats } from './dashboard.js';

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
        if (target === '#analytics') fetchRevenueAnalytics();
        if (target === '#discounts') fetchDiscountCodes();
        if (target === '#users') fetchUsers();
      });
    });
    fetchOrders();
    loadStats();
  }

  // Product form events
  document.getElementById('productImage')?.addEventListener('input', updateImagePreview);
  document.getElementById('productForm')?.addEventListener('submit', saveProduct);
  document.getElementById('productCancelBtn')?.addEventListener('click', hideProductForm);
  document.getElementById('productNewBtn')?.addEventListener('click', () => showProductForm());

  // Discount form events
  document.getElementById('discountForm')?.addEventListener('submit', saveDiscountCode);
  document.getElementById('discountCancelBtn')?.addEventListener('click', hideDiscountForm);
  document.getElementById('discountNewBtn')?.addEventListener('click', showDiscountForm);

  // User form events
  document.getElementById('userForm')?.addEventListener('submit', saveUser);
  document.getElementById('userCancelBtn')?.addEventListener('click', hideUserForm);
  document.getElementById('userNewBtn')?.addEventListener('click', () => showUserForm());
});
