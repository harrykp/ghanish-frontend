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

// === Global App Initializer (runs after nav loaded) ===
window.initGhanishUI = function() {
  const token = localStorage.getItem('token');

  const loginLink = document.getElementById('loginLink');
  const signupLink = document.getElementById('signupLink');
  const logoutLink = document.getElementById('logoutLink');
  const profileLink = document.getElementById('profileLink');
  const doLogout = document.getElementById('doLogout');

  doLogout?.addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });

  if (token) {
    loginLink?.classList.add('d-none');
    signupLink?.classList.add('d-none');
    logoutLink?.classList.remove('d-none');
    profileLink?.classList.remove('d-none');
  } else {
    logoutLink?.classList.add('d-none');
    loginLink?.classList.remove('d-none');
    signupLink?.classList.remove('d-none');
    profileLink?.classList.add('d-none');
  }

  updateCartCount();

  // === SMOOTH SCROLL + ACTIVE LINK ===
  const navLinks = document.querySelectorAll('.nav-link[href^=\"#\"], .nav-link[href*=\".html\"]');
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

  // === CONTACT FORM ===
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

  // === LOAD PRODUCTS on STORE PAGE ===
  const productGrid = document.getElementById('productGrid');
  if (productGrid) {
    fetch(`${API_URL}/api/products`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed to load'))
      .then(products => {
        products.forEach(product => {
          const col = document.createElement('div');
          col.className = 'col-12 col-md-6 col-lg-4 fade-in';
          col.innerHTML = `
            <div class="card h-100">
              ${product.image_url ? `<img src="${product.image_url}" class="card-img-top" alt="${product.name}">` : ''}
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">${product.description}</p>
                <p class="mt-auto fw-bold">$${parseFloat(product.price).toFixed(2)}</p>
                <button class="btn btn-success mt-2 add-to-cart"
                        data-id="${product.id}"
                        data-name="${product.name}"
                        data-price="${product.price}">Add to Cart</button>
              </div>
            </div>`;
          productGrid.appendChild(col);
          setTimeout(() => col.classList.add('visible'), 50);
        });
      })
      .catch(err => {
        console.error(err);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.textContent = 'Unable to load products at this time.';
        productGrid.parentElement.insertBefore(errorDiv, productGrid);
      });

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
};
