// js/includes.js

async function loadInclude(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const res = await fetch(url);
    if (res.ok) {
      el.innerHTML = await res.text();

      if (id === 'nav-placeholder') {
        if (typeof window.initGhanishUI === 'function') {
          window.initGhanishUI(); // optional global nav initializer
        }

        // 🔐 Toggle login/logout buttons based on token presence
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

        // 🔁 Bind logout functionality
        const logoutButton = document.getElementById('nav-logout');
        if (logoutButton) {
          logoutButton.addEventListener('click', (e) => {
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

document.addEventListener('DOMContentLoaded', () => {
  loadInclude('nav-placeholder', 'nav.html');
  loadInclude('footer-placeholder', 'footer.html');
});
