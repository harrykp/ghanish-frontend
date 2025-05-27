window.viewOrderDetails = function (...) {
  // modal logic here...
  fetch(...).then(r => r.json()).then(data => {
    // fill modal...
    const modal = new bootstrap.Modal(...);
    modal.show();
  });
};

// ✅ Now OUTSIDE that block, paste this:
window.exportOrdersToCSV = function () {
  const rows = [
    ['Order ID', 'Name', 'Phone', 'Total', 'Status', 'Created At'],
    ...allOrders.map(o => [
      o.id,
      o.full_name || '-',
      o.phone || '-',
      o.total,
      o.status,
      o.created_at
    ])
  ];

  const csv = rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
