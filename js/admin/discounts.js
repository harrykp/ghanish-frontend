// discounts.js
import { API_URL, headers, showToast } from './utils.js';

export function fetchDiscountCodes() {
  fetch(`${API_URL}/api/discounts`, { headers })
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById('discountList');
      if (!data.length) {
        list.innerHTML = '<p>No codes found.</p>';
        return;
      }
      list.innerHTML = `
        <table class="table table-bordered">
          <thead><tr><th>Code</th><th>% Off</th><th>Expires</th><th>Actions</th></tr></thead>
          <tbody>
            ${data.map(d => `
              <tr>
                <td>${d.code}</td>
                <td>${d.percent_off}%</td>
                <td>${d.expires_at ? new Date(d.expires_at).toLocaleString() : '—'}</td>
                <td><button class="btn btn-sm btn-danger delete-discount-btn" data-id="${d.id}">Delete</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      `;
    });
}
