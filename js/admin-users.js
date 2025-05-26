// === Admin Users Page ===

document.addEventListener('DOMContentLoaded', () => {
  if (location.pathname === '/admin-users.html') {
    fetchUsers();
  }
});

window.fetchUsers = function () {
  fetch(`${API_URL}/api/admin/users`, { headers })
    .then(r => r.json())
    .then(data => {
      const users = data.users || data;
      const list = document.getElementById('userList');
      if (!list) return;
      list.innerHTML = users.map(u => `
        <div class="card mb-2">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <strong>${u.full_name}</strong><br/>
              <small>${u.email}</small><br/>
              <small>${u.role}</small>
            </div>
            <div>
              <button class="btn btn-sm btn-outline-primary me-2" onclick="editUser(${u.id})">Edit</button>
              <button class="btn btn-sm btn-outline-warning me-2" onclick="resetPassword(${u.id})">Reset PW</button>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${u.id})">Delete</button>
            </div>
          </div>
        </div>
      `).join('');
    });
};

window.saveUser = function (e) {
  e.preventDefault();

  const id = document.getElementById('userId').value;
  const full_name = document.getElementById('userFullName').value;
  const email = document.getElementById('userEmail').value;
  const phone = document.getElementById('userPhone').value;
  const role = document.getElementById('userRole').value;
  const password = document.getElementById('userPassword').value;

  const payload = { full_name, email, phone, role };
  if (password) payload.password = password;

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/api/admin/users/${id}` : `${API_URL}/api/admin/users`;

  fetch(url, {
    method,
    headers,
    body: JSON.stringify(payload)
  }).then(() => {
    hideUserForm();
    fetchUsers();
  });
};

window.showUserForm = function () {
  const form = document.getElementById('userForm');
  form?.reset();
  form?.classList.remove('d-none');
};

window.hideUserForm = function () {
  document.getElementById('userForm')?.classList.add('d-none');
};

window.editUser = function (id) {
  fetch(`${API_URL}/api/admin/users`, { headers })
    .then(r => r.json())
    .then(data => {
      const users = data.users || data;
      const user = users.find(u => u.id === id);
      if (!user) return;

      document.getElementById('userId').value = user.id;
      document.getElementById('userFullName').value = user.full_name;
      document.getElementById('userEmail').value = user.email;
      document.getElementById('userPhone').value = user.phone;
      document.getElementById('userRole').value = user.role;
      showUserForm();
    });
};

window.resetPassword = function (id) {
  const newPassword = prompt('Enter new password (min 6 characters):');
  if (!newPassword || newPassword.length < 6) return alert('Password too short.');

  fetch(`${API_URL}/api/admin/users/${id}/reset-password`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ newPassword })
  }).then(() => {
    alert('Password reset successfully.');
  });
};

window.deleteUser = function (id) {
  if (!confirm('Delete this user?')) return;
  fetch(`${API_URL}/api/admin/users/${id}`, {
    method: 'DELETE',
    headers
  }).then(() => fetchUsers());
};
