document.addEventListener('DOMContentLoaded', () => {
  if (location.pathname === '/admin-blogs.html') {
    initTinyMCE();
    setupSlugAutogeneration();
    fetchBlogs();
  }
});

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

function initTinyMCE() {
  if (tinymce.get('blogContent')) {
    tinymce.get('blogContent').remove();
  }

  tinymce.init({
    selector: '#blogContent',
    height: 300,
    menubar: false,
    plugins: 'link image lists code',
    toolbar: 'undo redo | bold italic underline | bullist numlist | link image | code'
  });
}

function setupSlugAutogeneration() {
  const titleInput = document.getElementById('blogTitle');
  const slugInput = document.getElementById('blogSlug');

  titleInput?.addEventListener('input', () => {
    const slug = titleInput.value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    slugInput.value = slug;
  });
}

function showBlogForm() {
  document.getElementById('blogForm').reset();
  document.getElementById('blogId').value = '';
  document.getElementById('blogFormTitle').textContent = 'New Blog Post';
  tinymce.get('blogContent')?.setContent('');
  document.getElementById('blogForm').classList.remove('d-none');
}

function hideBlogForm() {
  document.getElementById('blogForm').classList.add('d-none');
}

function saveBlog(e) {
  e.preventDefault();

  const id = document.getElementById('blogId').value;
  const title = document.getElementById('blogTitle').value.trim();
  const slug = document.getElementById('blogSlug').value.trim();
  const category = document.getElementById('blogCategory').value.trim();
  const content = tinymce.get('blogContent')?.getContent().trim();
  const image_url = document.getElementById('blogImage').value.trim();

  const payload = JSON.stringify({ title, slug, content, category, image_url });

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
}

function editBlog(id) {
  const blog = allBlogs.find(b => b.id === id);
  if (!blog) return;

  document.getElementById('blogId').value = blog.id;
  document.getElementById('blogTitle').value = blog.title;
  document.getElementById('blogSlug').value = blog.slug;
  document.getElementById('blogCategory').value = blog.category || '';
  document.getElementById('blogImage').value = blog.image_url || '';
  tinymce.get('blogContent')?.setContent(blog.content || '');
  document.getElementById('blogFormTitle').textContent = 'Edit Blog Post';
  document.getElementById('blogForm').classList.remove('d-none');
}

function deleteBlog(id) {
  if (!confirm('Are you sure you want to delete this blog post?')) return;

  fetch(`${API_URL}/api/blogs/${id}`, {
    method: 'DELETE',
    headers
  })
    .then(() => fetchBlogs());
}

// ✅ Expose functions globally
window.showBlogForm = showBlogForm;
window.hideBlogForm = hideBlogForm;
window.saveBlog = saveBlog;
window.editBlog = editBlog;
window.deleteBlog = deleteBlog;
