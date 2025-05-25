// users.js
import { API_URL, headers, showToast } from './utils.js';

export function fetchUsers() {
  fetch(`${API_URL}/api/admin/users`, { headers })
    .then(r => r.json())
    .then(users => {
      const list = document.getElementById('userList');
      list.innerHTML = `
        <table class="table table-bordered">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td>${u.full_name}</td>
                <td>${u.email}</td>
                <td>${u.phone}</td>
                <td>${u.role}</td>
                <td>
                  <button class="btn btn-sm btn-warning me-1" data-edit-id="${u.id}">Edit</button>
                  <button class="btn btn-sm btn-danger me-1" data-delete-id="${u.id}">Delete</button>
                  <button class="btn btn-sm btn-secondary" data-reset-id="${u.id}">Reset Password</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>`;

      list.querySelectorAll('[data-edit-id]').forEach(btn =>
        btn.addEventListener('click', () => editUser(btn.dataset.editId)));

      list.querySelectorAll('[data-delete-id]').forEach(btn =>
        btn.addEventListener('click', () => deleteUser(btn.dataset.deleteId)));

      list.querySelectorAll('[data-reset-id]').forEach(btn =>
        btn.addEventListener('click', () => resetPassword(btn.dataset.resetId)));
    });
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
  fetch(url, { method, headers, body: JSON.stringify(body) })
    .then(r => {
      if (r.ok) {
        showToast('User saved', 'success');
        hideUserForm();
        fetchUsers();
      } else {
        showToast('Failed to save user', 'danger');
      }
    });
}

function editUser(id) {
  fetch(`${API_URL}/api/admin/users/${id}`, { headers })
    .then(r => r.json())
    .then(user => showUserForm(user));
}

function deleteUser(id) {
  if (!confirm('Delete this user?')) return;
  fetch(`${API_URL}/api/admin/users/${id}`, { method: 'DELETE', headers })
    .then(() => {
      showToast('User deleted', 'success');
      fetchUsers();
    });
}

function resetPassword(id) {
  const newPassword = prompt('Enter new password:');
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
