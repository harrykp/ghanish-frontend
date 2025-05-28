// === Admin Blogs Page ===

const blogForm = document.getElementById('blogForm');
const blogList = document.getElementById('blogList');
let editingBlogId = null;

document.addEventListener('DOMContentLoaded', () => {
  if (location.pathname === '/admin-blogs.html') {
    fetchBlogs();
  }
});

function fetchBlogs() {
  fetch(`${API_URL}/api/blogs`)
    .then(r => r.json())
    .then(data => renderBlogList(data))
    .catch(err => console.error('Failed to fetch blogs:', err));
}

function renderBlogList(blogs) {
  if (!blogList) return;
  if (!blogs.length) {
    blogList.innerHTML = '<p>No blog posts found.</p>';
    return;
  }

  blogList.innerHTML = `
    <table class="table table-bordered">
      <thead><tr><th>Title</th><th>Slug</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>
        ${blogs.map(blog => `
          <tr>
            <td>${blog.title}</td>
            <td>${blog.slug}</td>
            <td>${new Date(blog.created_at).toLocaleString()}</td>
            <td>
              <button class="btn btn-sm btn-warning me-2" onclick="editBlog(${blog.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteBlog(${blog.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

window.showBlogForm = function () {
  blogForm.reset();
  editingBlogId = null;
  blogForm.classList.remove('d-none');
  document.getElementById('blogFormTitle').textContent = 'New Blog Post';
};

window.hideBlogForm = function () {
  blogForm.classList.add('d-none');
};

function populateForm(blog) {
  document.getElementById('blogId').value = blog.id;
  document.getElementById('blogTitle').value = blog.title;
  document.getElementById('blogSlug').value = blog.slug;
  document.getElementById('blogImage').value = blog.image_url;
  document.getElementById('blogContent').value = blog.content;
  document.getElementById('blogFormTitle').textContent = 'Edit Blog Post';
  blogForm.classList.remove('d-none');
}

window.editBlog = function (id) {
  fetch(`${API_URL}/api/blogs/${id}`)
    .then(r => r.json())
    .then(blog => {
      editingBlogId = id;
      populateForm(blog);
    });
};

window.saveBlog = function (e) {
  e.preventDefault();
  const title = document.getElementById('blogTitle').value.trim();
  const slug = document.getElementById('blogSlug').value.trim();
  const image_url = document.getElementById('blogImage').value.trim();
  const content = document.getElementById('blogContent').value.trim();

  const method = editingBlogId ? 'PUT' : 'POST';
  const url = editingBlogId ? `${API_URL}/api/blogs/${editingBlogId}` : `${API_URL}/api/blogs`;

  fetch(url, {
    method,
    headers,
    body: JSON.stringify({ title, slug, content, image_url })
  })
    .then(r => r.json())
    .then(() => {
      hideBlogForm();
      fetchBlogs();
      showToast('Blog saved successfully', 'success');
    });
};

window.deleteBlog = function (id) {
  if (!confirm('Delete this blog post?')) return;
  fetch(`${API_URL}/api/blogs/${id}`, {
    method: 'DELETE',
    headers
  })
    .then(r => r.json())
    .then(() => {
      fetchBlogs();
      showToast('Blog deleted', 'danger');
    });
};
