// products.js
import { API_URL, headers, showToast } from './utils.js';

export function fetchProducts() {
  fetch(`${API_URL}/api/products`, { headers })
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById('productList');
      list.innerHTML = `
        <table class="table table-bordered">
          <thead><tr><th>Name</th><th>Price</th><th>Actions</th></tr></thead>
          <tbody>
            ${data.map(p => `
              <tr>
                <td><div class="d-flex align-items-center gap-2">
                  ${p.image_url ? `<img src="${p.image_url}" style="height:40px;">` : ''}${p.name}
                </div></td>
                <td>USD ${parseFloat(p.price).toFixed(2)}</td>
                <td>
                  <button class="btn btn-warning btn-sm edit-product-btn" data-product='${JSON.stringify(p)}'>Edit</button>
                  <button class="btn btn-danger btn-sm delete-product-btn" data-id="${p.id}">Delete</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      `;
    });
}
