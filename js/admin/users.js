// users.js
import { API_URL, headers, showToast } from './utils.js';

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
                  <button class="btn btn-warning btn-sm edit-user-btn" data-id="${u.id}">Edit</button>
                  <button class="btn btn-danger btn-sm delete-user-btn" data-id="${u.id}">Delete</button>
                  <button class="btn btn-secondary btn-sm reset-password-btn" data-id="${u.id}">Reset Password</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      `;
    });
}
