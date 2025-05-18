// js/includes.js

async function loadInclude(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const res = await fetch(url);
    if (res.ok) {
      el.innerHTML = await res.text();
      if (id === 'nav-placeholder' && typeof window.initGhanishUI === 'function') {
        window.initGhanishUI(); // initialize nav-based logic after nav is injected
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
