let allUsers = [];
let filteredUsers = [];
let currentUserPage = 1;
const usersPerPage = 10;

document.addEventListener('DOMContentLoaded', () => {
  if (location.pathname === '/admin-users.html') {
    fetchUsers();

    const searchInput = document.getElementById('userSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase();
        filteredUsers = allUsers.filter(u =>
          `${u.full_name} ${u.email} ${u.role}`.toLowerCase().includes(q)
        );
        renderUserTable(currentUserPage);
      });
    }
  }
});

window.fetchUsers = function () {
  fetch(`${API_URL}/api/admin/users`, { headers })
    .then(r => r.json())
    .then(data => {
      allUsers = data.users || data;
      filteredUsers = allUsers;
      renderUserTable(1);
    });
};

function renderUserTable(page) {
  currentUserPage = page;
  const start = (page - 1) * usersPerPage;
  const end = start + usersPerPage;
  const usersToShow = filteredUsers.slice(start, end);

  const list = document.getElementById('userList');
  if (!list) return;

  list.innerHTML = `
    <table class="table table-bordered">
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
      <tbody>
        ${usersToShow.map(u => `
          <tr>
            <td>${u.full_name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary me-1" onclick="editUser(${u.id})">Edit</button>
              <button class="btn btn-sm btn-outline-warning me-1" onclick="resetPassword(${u.id})">Reset PW</button>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${u.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  renderPagination('userPagination', filteredUsers.length, usersPerPage, currentUserPage, renderUserTable);
}

function renderPagination(containerId, totalItems, perPage, currentPage, onPageChange) {
  const totalPages = Math.ceil(totalItems / perPage);
  const pagination = document.getElementById(containerId);
  if (!pagination) return;

  let html = '';
  html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
    <a class="page-link" href="#" onclick="${onPageChange.name}(${currentPage - 1})">Previous</a>
  </li>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
      <a class="page-link" href="#" onclick="${onPageChange.name}(${i})">${i}</a>
    </li>`;
  }

  html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
    <a class="page-link" href="#" onclick="${onPageChange.name}(${currentPage + 1})">Next</a>
  </li>`;

  pagination.innerHTML = html;
}

window.exportUsersToCSV = function () {
  if (!filteredUsers.length) {
    showToast('No users to export.', 'warning');
    return;
  }

  const rows = [
    ['Name', 'Email', 'Role'],
    ...filteredUsers.map(u => [u.full_name, u.email, u.role])
  ];

  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `users-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

window.showUserForm = function () {
  document.getElementById('userForm')?.classList.remove('d-none');
};

window.hideUserForm = function () {
  document.getElementById('userForm')?.classList.add('d-none');
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
  if (!newPassword || newPassword.length < 6) {
    showToast('Password too short.', 'warning');
    return;
  }

  fetch(`${API_URL}/api/admin/users/${id}/reset-password`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ newPassword })
  }).then(() => {
    showToast('Password reset successfully.', 'success');
  });
};

window.deleteUser = function (id) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  fetch(`${API_URL}/api/admin/users/${id}`, {
    method: 'DELETE',
    headers
  }).then(() => fetchUsers());
};
