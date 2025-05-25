// public/js/admin/init.js

const tabs = {
  dashboard: () => import('./dashboard.js').then(mod => mod.initDashboardModule()),
  orders: () => import('./orders.js').then(mod => mod.initOrdersModule()),
  products: () => import('./products.js').then(mod => mod.initProductsModule()),
  users: () => import('./users.js').then(mod => mod.initUsersModule()),
  discounts: () => import('./discounts.js').then(mod => mod.initDiscountsModule()),
  analytics: () => import('./analytics.js').then(mod => mod.initAnalyticsModule())
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
  const sections = document.querySelectorAll('.admin-tab');
  const activeTab = document.querySelector(`[data-tab="${tabName}"]`);

  sections.forEach(section => section.classList.add('d-none'));
  document.getElementById(`${tabName}-tab`)?.classList.remove('d-none');

  document.querySelectorAll('#admin-tabs a[data-tab]').forEach(link =>
    link.classList.remove('active')
  );
  activeTab?.classList.add('active');

  if (tabs[tabName]) {
    tabs[tabName](); // dynamically import and initialize the module
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTabRouting();
});
