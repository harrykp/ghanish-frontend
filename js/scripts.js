// Replace with your real backend URL once deployed:
const API_URL = 'https://ghanish-backend.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => {
      if (res.ok) {
        alert('Thanks for reaching out! We’ll be in touch soon.');
        form.reset();
      } else {
        alert('Oops—something went wrong. Please try again later.');
      }
    })
    .catch(() => {
      alert('Network error. Please check your connection and try again.');
    });
  });
});
