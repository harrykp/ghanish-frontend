document.addEventListener('DOMContentLoaded', () => {
  if (location.pathname === '/admin-blogs.html') {
    fetchBlogs();
  }
});

const API_URL = 'https://ghanish-backend.onrender.com';
const token = localStorage.getItem('token');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

let allBlogs = [];

function fetchBlogs() {
  fetch(`${API_URL}/api/blogs`, { headers })
    .then(r => r.json())
    .then(data => {
      allBlogs = data || [];
      renderBlogList();
    });
}

function renderBlogList() {
  const list = document.getElementById('blogList');
  if (!list) return;

  if (allBlogs.length === 0) {
    list.innerHTML = `<p class="text-muted">No blog posts found.</p>`;
    return;
  }

  list.innerHTML = `
    <table class="table table-bordered table-striped">
      <thead><tr><th>Title</th><th>Category</th><th>Created At</th><th>Actions</th></tr></thead>
      <tbody>
        ${allBlogs.map(blog => `
          <tr>
            <td>${blog.title}</td>
            <td>${blog.category || '—'}</td>
            <td>${new Date(blog.created_at).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-sm btn-primary me-2" onclick="editBlog(${blog.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteBlog(${blog.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

window.showBlogForm = function () {
  document.getElementById('blogForm').reset();
  document.getElementById('blogId').value = '';
  document.getElementById('blogFormTitle').textContent = 'New Blog Post';
  document.getElementById('blogForm').classList.remove('d-none');
};

window.hideBlogForm = function () {
  document.getElementById('blogForm').classList.add('d-none');
};

window.saveBlog = function (e) {
  e.preventDefault();

  const id = document.getElementById('blogId').value;
  const title = document.getElementById('blogTitle').value.trim();
  const category = document.getElementById('blogCategory').value.trim();
  const content = document.getElementById('blogContent').value.trim();
  const image_url = document.getElementById('blogImage').value.trim();

  const payload = JSON.stringify({ title, content, category, image_url });

  const method = id ? 'PUT' : 'POST';
  const endpoint = id ? `${API_URL}/api/blogs/${id}` : `${API_URL}/api/blogs`;

  fetch(endpoint, {
    method,
    headers,
    body: payload
  })
    .then(r => r.json())
    .then(() => {
      fetchBlogs();
      hideBlogForm();
    });
};

window.editBlog = function (id) {
  const blog = allBlogs.find(b => b.id === id);
  if (!blog) return;

  document.getElementById('blogId').value = blog.id;
  document.getElementById('blogTitle').value = blog.title;
  document.getElementById('blogCategory').value = blog.category || '';
  document.getElementById('blogContent').value = blog.content;
  document.getElementById('blogImage').value = blog.image_url || '';
  document.getElementById('blogFormTitle').textContent = 'Edit Blog Post';
  document.getElementById('blogForm').classList.remove('d-none');
};

window.deleteBlog = function (id) {
  if (!confirm('Are you sure you want to delete this blog post?')) return;

  fetch(`${API_URL}/api/blogs/${id}`, {
    method: 'DELETE',
    headers
  })
    .then(() => fetchBlogs());
};
