// public/js/admin/init.js

const tabs = {
  dashboard: async () => {
    document.getElementById('dashboard-tab').classList.remove('d-none');
    const mod = await import('./dashboard.js');
    mod.initDashboardModule();
  },
  orders: async () => {
    document.getElementById('orders-tab').classList.remove('d-none');
    const mod = await import('./orders.js');
    mod.initOrdersModule();
  },
  products: async () => {
    document.getElementById('products-tab').classList.remove('d-none');
    const mod = await import('./products.js');
    mod.initProductsModule();
  },
  users: async () => {
    document.getElementById('users-tab').classList.remove('d-none');
    const mod = await import('./users.js');
    mod.initUsersModule();
  },
  discounts: async () => {
    document.getElementById('discounts-tab').classList.remove('d-none');
    const mod = await import('./discounts.js');
    mod.initDiscountsModule();
  },
  analytics: async () => {
    document.getElementById('analytics-tab').classList.remove('d-none');
    const mod = await import('./analytics.js');
    mod.initAnalyticsModule();
  }
};

function initTabRouting() {
  const navLinks = document.querySelectorAll('#admin-tabs a[data-tab]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.getAttribute('data-tab');
      if (tab) {
        showTab(tab);
        window.history.pushState({}, '', `#${tab}`);
      }
    });
  });

  // Load tab from hash or default to dashboard
  const defaultTab = window.location.hash.replace('#', '') || 'dashboard';
  showTab(defaultTab);
}

function showTab(tabName) {
  // Hide all tab sections
  document.querySelectorAll('.admin-tab').forEach(section => {
    section.classList.add('d-none');
  });

  // Deactivate all nav links
  document.querySelectorAll('#admin-tabs a[data-tab]').forEach(link => {
    link.classList.remove('active');
  });

  // Activate selected tab and nav link
  const section = document.getElementById(`${tabName}-tab`);
  const navLink = document.querySelector(`#admin-tabs a[data-tab="${tabName}"]`);

  if (section) section.classList.remove('d-none');
  if (navLink) navLink.classList.add('active');

  // Initialize module
  if (tabs[tabName]) tabs[tabName]();
}

document.addEventListener('DOMContentLoaded', () => {
  initTabRouting();
});
