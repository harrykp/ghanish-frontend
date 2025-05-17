// Replace with your real backend URL once deployed:
const API_URL = 'https://ghanish-backend.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll active-link highlighting
  const navLinks = document.querySelectorAll('.nav-link');
  document.addEventListener('scroll', () => {
    const fromTop = window.scrollY + 80;
    navLinks.forEach(link => {
      if (!link.hash) return;
      const section = document.querySelector(link.hash);
      if (!section) return;
      if (
        section.offsetTop <= fromTop &&
        (section.offsetTop + section.offsetHeight) > fromTop
      ) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  });

  // Fade-in on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // Contact Form: loading overlay & toasts
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Create loader overlay
  const loader = document.createElement('div');
  loader.className = 'loading-overlay';
  loader.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
  document.body.appendChild(loader);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    loader.classList.add('show');
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;

    try {
      const data = Object.fromEntries(new FormData(form));
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      loader.classList.remove('show');
      submitBtn.disabled = false;

      if (res.ok) {
        form.reset();
        showToast('Thank you! We’ll be in touch soon.', 'success');
      } else {
        showToast(json.error || 'Something went wrong.', 'danger');
      }
    } catch (err) {
      loader.classList.remove('show');
      submitBtn.disabled = false;
      showToast('Network error. Please try again.', 'warning');
    }
  });

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
    const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
    bsToast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  }
});
