// public/js/admin/init.js

const tabs = {
  dashboard: async () => {
    document.getElementById('dashboard-tab').classList.remove('hidden');
    const mod = await import('./dashboard.js');
    mod.initDashboardModule();
  },
  orders: async () => {
    document.getElementById('orders-tab').classList.remove('hidden');
    const mod = await import('./orders.js');
    mod.initOrdersModule();
  },
  products: async () => {
    document.getElementById('products-tab').classList.remove('hidden');
    const mod = await import('./products.js');
    mod.initProductsModule();
  },
  users: async () => {
    document.getElementById('users-tab').classList.remove('hidden');
    const mod = await import('./users.js');
    mod.initUsersModule();
  },
  discounts: async () => {
    document.getElementById('discounts-tab').classList.remove('hidden');
    const mod = await import('./discounts.js');
    mod.initDiscountsModule();
  },
  analytics: () => {
    const section = document.getElementById('analytics-tab');
    section.classList.remove('hidden');

    // Ensure DOM paints the visible canvas before initAnalyticsModule runs
    requestAnimationFrame(() => {
      setTimeout(async () => {
        const mod = await import('./analytics.js');
        mod.initAnalyticsModule();
      }, 50);
    });
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

  const defaultTab = window.location.hash.replace('#', '') || 'dashboard';
  showTab(defaultTab);
}

function showTab(tabName) {
  document.querySelectorAll('.admin-tab').forEach(section =>
    section.classList.add('hidden')
  );

  document.querySelectorAll('#admin-tabs a[data-tab]').forEach(link =>
    link.classList.remove('active')
  );

  const section = document.getElementById(`${tabName}-tab`);
  const navLink = document.querySelector(`#admin-tabs a[data-tab="${tabName}"]`);

  if (section) section.classList.remove('hidden');
  if (navLink) navLink.classList.add('active');

  if (tabs[tabName]) tabs[tabName]();
}

document.addEventListener('DOMContentLoaded', () => {
  initTabRouting();
});
