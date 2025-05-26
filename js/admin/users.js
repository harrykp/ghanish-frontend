// public/js/admin/users.js

import {
  showLoading,
  showError,
  showToast,
  delegate
} from './utils.js';
import { API_BASE, authHeaders } from './config.js';

async function fetchUsers() {
  const container = document.getElementById('users-container');
  showLoading(container);

  try {
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      headers: authHeaders()
    });
    const data = await res.json();

    const users = data.users || data;
    if (!Array.isArray(users)) {
      showError(container, data.message || 'Failed to load users.');
      return;
    }

    renderUsers(users);
  } catch (err) {
    showError(container, 'Error loading users.');
  }
}

function renderUsers(users) {
  const container = document.getElementById('users-container');
  if (!users.length) {
    container.innerHTML = '<p>No users found.</p>';
    return;
  }

  container.innerHTML = users.map(user => `
    <div class="user-card">
      <p><strong>${user.full_name}</strong> (${user.email})</p>
      <p>Role: ${user.role}</p>
      <button class="btn btn-sm btn-warning edit-user" data-id="${user.id}">Edit</button>
      <button class="btn btn-sm btn-danger delete-user" data-id="${user.id}">Delete</button>
      <button class="btn btn-sm btn-secondary reset-password" data-id="${user.id}">Reset Password</button>
    </div>
  `).join('');
}

async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;

  try {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    const data = await res.json();
    if (data.message) {
      showToast('success', 'User deleted.');
      fetchUsers();
    } else {
      showToast('error', data.error || 'Failed to delete user.');
    }
  } catch (err) {
    showToast('error', 'Error deleting user.');
  }
}

async function resetUserPassword(userId) {
  const newPassword = prompt('Enter new password (min 6 chars):');
  if (!newPassword || newPassword.length < 6) {
    return showToast('error', 'Password must be at least 6 characters.');
  }

  try {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ newPassword })
    });
    const data = await res.json();
    if (data.message) {
      showToast('success', 'Password reset successfully.');
    } else {
      showToast('error', data.error || 'Failed to reset password.');
    }
  } catch (err) {
    showToast('error', 'Error resetting password.');
  }
}

async function fetchUserById(userId) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      headers: authHeaders()
    });
    const data = await res.json();
    const user = (data.users || data).find(u => u.id === parseInt(userId));
    if (user) populateEditForm(user);
    else showToast('error', 'User not found.');
  } catch (err) {
    showToast('error', 'Error fetching user.');
  }
}

function populateEditForm(user) {
  const form = document.getElementById('user-form');
  form['user-id'].value = user.id;
  form['full-name'].value = user.full_name;
  form['email'].value = user.email;
  form['role'].value = user.role;
}

async function handleUserFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const id = form['user-id'].value;
  const full_name = form['full-name'].value;
  const email = form['email'].value;
  const role = form['role'].value;
  const payload = { full_name, email, role };
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_BASE}/api/admin/users/${id}` : `${API_BASE}/api/admin/users`;

  try {
    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.message || data.id) {
      showToast('success', `User ${id ? 'updated' : 'created'} successfully.`);
      form.reset();
      fetchUsers();
    } else {
      showToast('error', data.error || 'Failed to save user.');
    }
  } catch (err) {
    showToast('error', 'Error saving user.');
  }
}

function attachEventListeners() {
  const form = document.getElementById('user-form');
  if (form) {
    form.addEventListener('submit', handleUserFormSubmit);
  }
  delegate(document, '.edit-user', (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) fetchUserById(id);
  });
  delegate(document, '.delete-user', (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) deleteUser(id);
  });
  delegate(document, '.reset-password', (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) resetUserPassword(id);
  });
}

export function initUsersModule() {
  fetchUsers();
  attachEventListeners();
}
