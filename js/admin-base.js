// === Admin Base Script: Shared across all admin pages ===

// API config
if (typeof API_URL === 'undefined') {
  window.API_URL = 'https://ghanish-backend.onrender.com';
}

// Auth check
const token = localStorage.getItem('token');
if (!token) {
  alert("Unauthorized");
  location.href = "/login.html";
}

window.headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// Highlight current admin nav item
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  document.querySelectorAll('#adminNavbar .nav-link').forEach(link => {
    if (link.getAttribute('href') === path) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});
