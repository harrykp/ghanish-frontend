// === Admin Blog Management ===

document.addEventListener('DOMContentLoaded', () => {
  if (location.pathname === '/admin-blogs.html') {
    fetchBlogs();
    initTinyMCE();
    document.getElementById('blogTitle').addEventListener('input', generateSlug);
  }
});

let currentBlogs = [];

function fetchBlogs() {
  fetch(`${API_URL}/api/blogs`)
    .then(r => r.json())
    .then(data => {
      currentBlogs = data;
      renderBlogList(data);
    });
}

function renderBlogList(blogs) {
  const list = document.getElementById('blogList');
  if (!list) return;
  if (!blogs.length) {
    list.innerHTML = `<p class="text-muted">No blogs yet.</p>`;
    return;
  }

  list.innerHTML = `
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Title</th>
          <th>Slug</th>
          <th>Image</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${blogs.map(b => `
          <tr>
            <td>${b.title}</td>
            <td>${b.slug}</td>
            <td>${b.image_url ? `<img src="${b.image_url}" alt="" style="height: 40px;">` : '—'}</td>
            <td>${new Date(b.created_at).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-sm btn-info me-2" onclick="editBlog(${b.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteBlog(${b.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

window.showBlogForm = function () {
  document.getElementById('blogFormTitle').textContent = 'New Blog';
  document.getElementById('blogForm').reset();
  tinymce.get('blogContent')?.setContent('');
  document.getElementById('blogId').value = '';
  document.getElementById('blogForm').classList.remove('d-none');
};

window.hideBlogForm = function () {
  document.getElementById('blogForm').classList.add('d-none');
};

window.editBlog = function (id) {
  const blog = currentBlogs.find(b => b.id === id);
  if (!blog) return;

  document.getElementById('blogId').value = blog.id;
  document.getElementById('blogTitle').value = blog.title;
  document.getElementById('blogSlug').value = blog.slug;
  document.getElementById('blogImage').value = blog.image_url;
  tinymce.get('blogContent')?.setContent(blog.content || '');

  document.getElementById('blogFormTitle').textContent = 'Edit Blog';
  document.getElementById('blogForm').classList.remove('d-none');
};

window.deleteBlog = function (id) {
  if (!confirm('Delete this blog post?')) return;
  fetch(`${API_URL}/api/blogs/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(() => fetchBlogs());
};

window.saveBlog = function (e) {
  e.preventDefault();

  const id = document.getElementById('blogId').value;
  const title = document.getElementById('blogTitle').value.trim();
  const slug = document.getElementById('blogSlug').value.trim();
  const image_url = document.getElementById('blogImage').value.trim();
  const content = tinymce.get('blogContent')?.getContent() || '';

  const payload = { title, slug, image_url, content };

  const method = id ? 'PUT' : 'POST';
  const endpoint = id ? `${API_URL}/api/blogs/${id}` : `${API_URL}/api/blogs`;

  fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(payload)
  })
    .then(r => r.json())
    .then(() => {
      hideBlogForm();
      fetchBlogs();
    });
};

function generateSlug() {
  const title = document.getElementById('blogTitle').value.trim();
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  document.getElementById('blogSlug').value = slug;
}

function initTinyMCE() {
  tinymce.init({
    selector: '#blogContent',
    height: 300,
    menubar: false,
    plugins: 'link image lists code',
    toolbar: 'undo redo | bold italic underline | bullist numlist | link image | code'
  });
}
