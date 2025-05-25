// js/admin/users.js
import { showToast } from './utils.js';

const API_URL = window.API_URL;
const token = localStorage.getItem('token');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

export function fetchUsers() {
  fetch(`${API_URL}/api/admin/users`, { headers })
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById('userList');
      if (!Array.isArray(data)) {
        list.innerHTML = '<div class="alert alert-warning">Failed to load users.</div>';
        return;
      }

      list.innerHTML = `
        <table class="table table-bordered">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            ${data.map(u => `
              <tr>
                <td>${u.full_name}</td>
                <td>${u.email}</td>
                <td>${u.phone}</td>
                <td>${u.role}</td>
                <td>
                  <button class="btn btn-sm btn-warning me-1 edit-user-btn" data-id="${u.id}">Edit</button>
                  <button class="btn btn-sm btn-danger me-1 delete-user-btn" data-id="${u.id}">Delete</button>
                  <button class="btn btn-sm btn-secondary reset-user-btn" data-id="${u.id}">Reset Password</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>`;

      bindUserActionButtons();
    });
}

function bindUserActionButtons() {
  document.querySelectorAll('.edit-user-btn').forEach(btn =>
    btn.addEventListener('click', () => editUser(btn.dataset.id))
  );
  document.querySelectorAll('.delete-user-btn').forEach(btn =>
    btn.addEventListener('click', () => deleteUser(btn.dataset.id))
  );
  document.querySelectorAll('.reset-user-btn').forEach(btn =>
    btn.addEventListener('click', () => resetPassword(btn.dataset.id))
  );
}

export function showUserForm(user = {}) {
  document.getElementById('userForm').classList.remove('d-none');
  document.getElementById('userId').value = user.id || '';
  document.getElementById('userFullName').value = user.full_name || '';
  document.getElementById('userEmail').value = user.email || '';
  document.getElementById('userPhone').value = user.phone || '';
  document.getElementById('userRole').value = user.role || 'customer';
  document.getElementById('userPassword').value = '';
}

export function hideUserForm() {
  document.getElementById('userForm').reset();
  document.getElementById('userForm').classList.add('d-none');
}

export function saveUser(e) {
  e.preventDefault();
  const id = document.getElementById('userId').value;
  const body = {
    full_name: document.getElementById('userFullName').value,
    email: document.getElementById('userEmail').value,
    phone: document.getElementById('userPhone').value,
    role: document.getElementById('userRole').value,
    password: document.getElementById('userPassword').value
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/api/admin/users/${id}` : `${API_URL}/api/admin/users`;
  fetch(url, {
    method,
    headers,
    body: JSON.stringify(body)
  }).then(r => {
    if (r.ok) {
      showToast('User saved', 'success');
      hideUserForm();
      fetchUsers();
    } else {
      showToast('Failed to save user', 'danger');
    }
  });
}

export function deleteUser(id) {
  if (!confirm('Delete this user?')) return;
  fetch(`${API_URL}/api/admin/users/${id}`, {
    method: 'DELETE',
    headers
  }).then(() => {
    showToast('User deleted', 'success');
    fetchUsers();
  });
}

export function resetPassword(id) {
  const newPassword = prompt("Enter new password:");
  if (!newPassword) return;
  fetch(`${API_URL}/api/admin/users/${id}/reset-password`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ password: newPassword })
  }).then(r => {
    if (r.ok) showToast('Password reset', 'success');
    else showToast('Failed to reset password', 'danger');
  });
}

export function editUser(id) {
  fetch(`${API_URL}/api/admin/users/${id}`, { headers })
    .then(r => {
      if (!r.ok) throw new Error('User not found');
      return r.json();
    })
    .then(user => showUserForm(user))
    .catch(err => {
      console.error(err);
      showToast('Failed to fetch user', 'danger');
    });
}
