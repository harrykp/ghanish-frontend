// utils.js
export const API_URL = 'https://ghanish-backend.onrender.com';

export const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};

export function showToast(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
  alert.style.zIndex = 9999;
  alert.innerHTML = message;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}
