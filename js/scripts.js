// Replace with your real backend URL once deployed:
const API_URL = 'https://ghanish-backend.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  // === AUTH NAV TOGGLING & LOGOUT ===
  const token = localStorage.getItem('token');
  const loginLink = document.getElementById('loginLink');
  const signupLink = document.getElementById('signupLink');
  const logoutLink = document.getElementById('logoutLink');
  const doLogout = document.getElementById('doLogout');

  if (token) {
    loginLink.classList.add('d-none');
    signupLink.classList.add('d-none');
    logoutLink.classList.remove('d-none');
  } else {
    logoutLink.classList.add('d-none');
    loginLink.classList.remove('d-none');
    signupLink.classList.remove('d-none');
  }
  doLogout?.addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });

  // === SMOOTH SCROLL + ACTIVE LINK ===
  const navLinks = document.querySelectorAll('.nav-link[href^="#"], .nav-link[href*=".html"]');
  document.addEventListener('scroll', () => {
    const fromTop = window.scrollY + 80;
    navLinks.forEach(link => {
      const hash = link.hash;
      if (!hash) return;
      const section = document.querySelector(hash);
      if (!section) return;
      if (section.offsetTop <= fromTop && (section.offsetTop + section.offsetHeight) > fromTop) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
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

  // === CONTACT FORM ===
  const form = document.getElementById('contactForm');
  if (form) { /* existing code */ }

  // === ADD TO CART HANDLER ===
  const grid = document.getElementById('productGrid');
  if (grid) {
    grid.addEventListener('click', e => {
      if (e.target.classList.contains('add-to-cart')) {
        const id = +e.target.dataset.id;
        const name = e.target.dataset.name;
        const price = +e.target.dataset.price;
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find(item => item.id === id);
        if (existing) existing.quantity += 1;
        else cart.push({ id, name, price, quantity: 1 });
        localStorage.setItem('cart', JSON.stringify(cart));
        showToast('Added to cart', 'success');
        updateCartCount();
      }
    });
  }

  // === CART COUNT UPDATE ===
  window.updateCartCount = function() {
    const countBadge = document.getElementById('cartCountBadge');
    const countInline = document.getElementById('cartCountInline');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
    if (countBadge) countBadge.textContent = totalItems;
    if (countInline) countInline.textContent = totalItems;
  };

  // Toast helper
  function showToast(message, type='info') {
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
  }
});
