// js/includes.js

async function loadInclude(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const res = await fetch(url);
    if (res.ok) {
      el.innerHTML = await res.text();

      if (id === 'nav-placeholder') {
        // Run nav logic after it's injected
        if (typeof window.initGhanishUI === 'function') {
          window.initGhanishUI();
        }

        // Login/logout visibility toggles
        const token = localStorage.getItem('token');
        const loginLink = document.querySelector('#nav-login');
        const logoutLink = document.querySelector('#nav-logout');

        if (loginLink && logoutLink) {
          if (token) {
            loginLink.style.display = 'none';
            logoutLink.style.display = 'inline-block';
          } else {
            loginLink.style.display = 'inline-block';
            logoutLink.style.display = 'none';
          }
        }

        // Logout logic
        const logoutBtn = document.getElementById('nav-logout');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.href = '/login.html';
          });
        }
      }
    } else {
      console.error(`Failed to load ${url}: ${res.status}`);
    }
  } catch (e) {
    console.error('Error fetching include', url, e);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  let isAdmin = false;

  // If token exists, decode it and check role
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      isAdmin = payload.role === 'admin';
    } catch (err) {
      console.warn('Invalid token payload', err);
    }
  }

  const navFile = isAdmin ? 'admin-nav.html' : 'nav.html';
  loadInclude('nav-placeholder', navFile);
  loadInclude('footer-placeholder', 'footer.html');
});
