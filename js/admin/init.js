// js/admin/init.js
import { fetchOrders, exportOrdersToCSV, printOrderModal } from './orders.js';
import { fetchProducts, showProductForm, hideProductForm, saveProduct } from './products.js';
import { fetchRevenueAnalytics } from './analytics.js';
import { fetchDiscountCodes, showDiscountForm } from './discounts.js';
import { fetchUsers, showUserForm, deleteUser, resetPassword, saveUser, editUser } from './users.js';
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

    // Initial load
    fetchOrders();
    loadStats();
  }

  // Global action bindings
  document.getElementById('exportOrdersBtn')?.addEventListener('click', exportOrdersToCSV);
  document.getElementById('printOrdersBtn')?.addEventListener('click', printOrderModal);

  document.getElementById('newProductBtn')?.addEventListener('click', () => showProductForm());
  document.getElementById('cancelProductBtn')?.addEventListener('click', hideProductForm);
  document.getElementById('productForm')?.addEventListener('submit', saveProduct);

  document.getElementById('newDiscountBtn')?.addEventListener('click', () => showDiscountForm());

  document.getElementById('newUserBtn')?.addEventListener('click', () => showUserForm());
  document.getElementById('cancelUserBtn')?.addEventListener('click', () => document.getElementById('userForm').classList.add('d-none'));
  document.getElementById('userForm')?.addEventListener('submit', saveUser);

  // Expose user actions globally for onclick attributes (temporary fallback)
  window.editUser = editUser;
  window.deleteUser = deleteUser;
  window.resetPassword = resetPassword;
});
