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

// 商品編號在 Sheet 裡本來就存成 "#5209" 這種含 # 的格式。
// 連結網址故意不帶 #（TikTok 內建瀏覽器對網址帶 # / %23 的連結會攔截，
// 強制跳出「用瀏覽器開啟」的安全頁面，多一次點擊 — 拿掉它可以讓使用者
// 從列表頁點商品直接進到詳情頁，不被多攔一次）。
function normalizeProductId(id) {
  return String(id == null ? '' : id).trim().replace(/^#/, '');
}

function renderProductCard(product) {
  const a = document.createElement('a');
  a.className = 'product-card';
  a.href = 'product.html?id=' + encodeURIComponent(normalizeProductId(product.id));

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
