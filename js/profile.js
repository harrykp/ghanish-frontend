const token = localStorage.getItem('token');
if (!token) {
  showToast('Please log in first', 'warning');
  setTimeout(() => window.location.href = 'login.html', 1000);
}

// Load profile data
(async () => {
  try {
    const res = await fetch(`${API_URL}/api/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();
    const user = await res.json();
    document.getElementById('fullName').value = user.full_name || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('email').value = user.email || '';
  } catch {
    showToast('Failed to load profile', 'danger');
  }
})();

// Update profile
document.getElementById('profileForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const body = {
    full_name: e.target.fullName.value.trim(),
    phone: e.target.phone.value.trim(),
    email: e.target.email.value.trim()
  };
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const json = await res.json();
  showToast(json.message || 'Update failed', res.ok ? 'success' : 'danger');
});

// Change password
document.getElementById('passwordForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const body = {
    currentPassword: e.target.currentPassword.value,
    newPassword: e.target.newPassword.value
  };
  const res = await fetch(`${API_URL}/api/auth/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const json = await res.json();
  showToast(json.message || 'Password change failed', res.ok ? 'success' : 'danger');
});
