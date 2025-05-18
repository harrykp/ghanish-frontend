// js/includes.js
async function loadInclude(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const res = await fetch(url);
    if (res.ok) {
      el.innerHTML = await res.text();
      // After nav is in place, re-run scripts that depend on it:
      if (id === 'nav-placeholder' && window.updateCartCount) {
        updateCartCount();
        // Also toggle profileLink visibility:
        const token = localStorage.getItem('token');
        document.getElementById('profileLink')
          .classList.toggle('d-none', !token);
      }
    } else {
      console.error(`Failed to load ${url}: ${res.status}`);
    }
  } catch (e) {
    console.error('Error fetching include', url, e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadInclude('nav-placeholder', '/nav.html');
  loadInclude('footer-placeholder', '/footer.html');
});
