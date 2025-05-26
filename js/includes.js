// js/includes.js

async function loadInclude(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const res = await fetch(url);
    if (res.ok) {
      el.innerHTML = await res.text();

      if (id === 'nav-placeholder') {
        // Run nav UI logic after injection
        if (typeof window.initGhanishUI === 'function') {
          window.initGhanishUI();
        }

        // Show/hide login/logout links
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

        // Bind logout buttons (both customer + admin)
        ['nav-logout', 'admin-logout'].forEach(id => {
          const btn = document.getElementById(id);
          if (btn) {
            btn.addEventListener('click', (e) => {
              e.preventDefault();
              localStorage.removeItem('token');
              window.location.href = '/index.html';
            });
          }
        });
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

  // Decode token to check admin role
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
