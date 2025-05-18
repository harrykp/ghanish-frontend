// Replace with your actual backend URL
const API_URL = 'https://ghanish-backend.onrender.com';

// === Global Toast Helper ===
window.showToast = function(message, type = 'info') {
  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center text-bg-${type} border-0 position-fixed bottom-0 end-0 m-3`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  document.body.appendChild(toastEl);
  new bootstrap.Toast(toastEl, { delay: 4000 }).show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
};

// === Global Cart Count Updater ===
window.updateCartCount = function() {
  const countBadge = document.getElementById('cartCountBadge');
  const countInline = document.getElementById('cartCountInline');
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  if (countBadge) countBadge.textContent = totalItems;
  if (countInline) countInline.textContent = totalItems;
};

document.addEventListener('DOMContentLoaded', () => {
  // === AUTH NAV TOGGLING & LOGOUT ===
  const token = localStorage.getItem('token');
  const loginLink = document.getElementById('loginLink');
  const signupLink = document.getElementById('signupLink');
  const logoutLink = document.getElementById('logoutLink');
  const profileLink = document.getElementById('profileLink');
  const doLogout = document.getElementById('doLogout');

  // Toggle visibility based on login state
  if (token) {
    loginLink.classList.add('d-none');
    signupLink.classList.add('d-none');
    logoutLink.classList.remove('d-none');
    profileLink.classList.remove('d-none');
  } else {
    logoutLink.classList.add('d-none');
    loginLink.classList.remove('d-none');
    signupLink.classList.remove('d-none');
    profileLink.classList.add('d-none');
  }

  doLogout?.addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });

  // Initialize cart badges
  updateCartCount();

  // === SMOOTH SCROLL + ACTIVE LINK ===
  const navLinks = document.querySelectorAll('.nav-link[href^="#"], .nav-link[href*=".html"]');
  document.addEventListener('scroll', () => {
    const fromTop = window.scrollY + 80;
    navLinks.forEach(link => {
      const hash = link.hash;
      if (!hash) return;
      const section = document.querySelector(hash);
      if (!section) return;
      link.classList.toggle('active',
        section.offsetTop <= fromTop &&
        (section.offsetTop + section.offsetHeight) > fromTop
      );
    });
  });

  // === FADE-IN ON SCROLL ===
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // === CONTACT FORM WITH LOADER & TOASTS ===
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const loader = document.createElement('div');
    loader.className = 'loading-overlay';
    loader.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
    document.body.appendChild(loader);

    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      loader.classList.add('show');
      const btn = contactForm.querySelector('[type="submit"]');
      btn.disabled = true;
      try {
        const data = Object.fromEntries(new FormData(contactForm));
        const res = await fetch(`${API_URL}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const json = await res.json();
        loader.classList.remove('show');
        btn.disabled = false;
        if (res.ok) {
          contactForm.reset();
          showToast('Thank you! We’ll be in touch soon.', 'success');
        } else {
          showToast(json.error || 'Something went wrong.', 'danger');
        }
      } catch {
        loader.classList.remove('show');
        btn.disabled = false;
        showToast('Network error. Please try again.', 'warning');
      }
    });
  }

  // === ADD TO CART HANDLER ===
  const productGrid = document.getElementById('productGrid');
  if (productGrid) {
    productGrid.addEventListener('click', e => {
      const btn = e.target.closest('.add-to-cart');
      if (!btn) return;
      const id = +btn.dataset.id;
      const name = btn.dataset.name;
      const price = +btn.dataset.price;
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing = cart.find(item => item.id === id);
      if (existing) existing.quantity += 1;
      else cart.push({ id, name, price, quantity: 1 });
      localStorage.setItem('cart', JSON.stringify(cart));
      showToast('Added to cart', 'success');
      updateCartCount();
    });
  }
});
