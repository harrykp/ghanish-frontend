import { fetchOrders, exportOrdersToCSV, printOrderModal } from './orders.js';
import { fetchProducts, showProductForm, hideProductForm, saveProduct, deleteProduct } from './products.js';
import { fetchUsers, editUser, deleteUser, resetPassword } from './users.js';
import { fetchDiscountCodes, showDiscountForm, saveDiscountCode } from './discounts.js';
import { fetchRevenueAnalytics, fetchTopProductsAnalytics } from './analytics.js';

document.addEventListener('DOMContentLoaded', () => {
  // Tab links event listener to switch between tabs
  const tabButtons = document.querySelectorAll('#adminTabs .nav-link');
  if (tabButtons.length) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', e => {
        const target = e.target.getAttribute('href');
        if (target === '#orders') fetchOrders();
        if (target === '#products') fetchProducts();
        if (target === '#analytics') fetchRevenueAnalytics();
        if (target === '#discounts') fetchDiscountCodes();
        if (target === '#users') fetchUsers();
      });
    });
  }

  // Order Buttons
  const exportCSVBtn = document.getElementById('exportCSVBtn');
  const printOrdersBtn = document.getElementById('printOrdersBtn');
  exportCSVBtn.addEventListener('click', exportOrdersToCSV);
  printOrdersBtn.addEventListener('click', printOrderModal);

  // Product Buttons
  const addProductBtn = document.getElementById('addProductBtn');
  addProductBtn.addEventListener('click', showProductForm);

  // Cancel Product Form Button
  const cancelProductBtn = document.getElementById('cancelProductBtn');
  cancelProductBtn.addEventListener('click', hideProductForm);

  // User Buttons
  const addUserBtn = document.getElementById('addUserBtn');
  addUserBtn.addEventListener('click', () => showUserForm());
  
  // Discount Buttons
  const addDiscountBtn = document.getElementById('addDiscountBtn');
  addDiscountBtn.addEventListener('click', showDiscountForm);

  // Handle form submission events (Product, User, Discount)
  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', saveProduct);
  }

  const userForm = document.getElementById('userForm');
  if (userForm) {
    userForm.addEventListener('submit', saveUser);
  }

  const discountForm = document.getElementById('discountForm');
  if (discountForm) {
    discountForm.addEventListener('submit', saveDiscountCode);
  }
});
