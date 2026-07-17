// 共用小工具與商品卡片渲染，list.js（商品列表頁）與 detail.js（詳情頁「更多款式」）共用同一份，
// 避免同一份卡片排版邏輯在兩個頁面各自實作一次。

function formatPrice(price) {
  const n = Number(price);
  if (isNaN(n)) return price;
  return 'NT$' + n.toLocaleString('en-US');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str == null ? '' : str);
  return div.innerHTML;
}

function renderProductCard(product) {
  const a = document.createElement('a');
  a.className = 'product-card';
  a.href = 'product.html?id=' + encodeURIComponent(product.id);

  const img = document.createElement('img');
  img.className = 'thumb';
  img.loading = 'lazy';
  img.alt = product.model || '';
  if (product.coverPhotoUrl) {
    img.src = product.coverPhotoUrl;
  } else {
    img.classList.add('placeholder');
    img.alt = 'Tidak ada foto';
  }

  const info = document.createElement('div');
  info.className = 'info';
  info.innerHTML =
    '<p class="model">' + escapeHtml(product.model || '') + '</p>' +
    '<p class="spec">' + escapeHtml([product.capacity, product.color].filter(Boolean).join(' · ')) + '</p>' +
    '<p class="spec">' + escapeHtml(formatBattery(product.battery)) + '</p>' +
    '<p class="price">' + escapeHtml(formatPrice(product.price)) + '</p>' +
    '<p class="store">' + escapeHtml(product.store || '') + '</p>';

  a.appendChild(img);
  a.appendChild(info);
  return a;
}
