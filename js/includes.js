// public/js/includes.js

async function loadInclude(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const res = await fetch(url);
    if (res.ok) {
      el.innerHTML = await res.text();

      // After nav loads, handle logout (if admin)
      if (id === 'nav-placeholder') {
        const isAdmin = location.pathname.startsWith('/admin');
        const logoutBtn = document.getElementById('admin-logout');
        if (isAdmin && logoutBtn) {
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

document.addEventListener('DOMContentLoaded', () => {
  const isAdmin = location.pathname.startsWith('/admin');
  const navUrl = isAdmin ? 'admin-nav.html' : 'nav.html';

  loadInclude('nav-placeholder', navUrl);
  loadInclude('footer-placeholder', 'footer.html');
});
