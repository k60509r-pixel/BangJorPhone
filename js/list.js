function formatPrice(price) {
  const n = Number(price);
  if (isNaN(n)) return price;
  return 'NT$' + n.toLocaleString('en-US');
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

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str == null ? '' : str);
  return div.innerHTML;
}

async function initListPage() {
  const grid = document.getElementById('product-grid');
  const stateEl = document.getElementById('state-message');
  try {
    const products = await fetchProductList();
    if (!products || products.length === 0) {
      stateEl.textContent = 'Belum ada produk tersedia saat ini.';
      return;
    }
    stateEl.style.display = 'none';
    products.forEach(function (product) {
      grid.appendChild(renderProductCard(product));
    });
  } catch (err) {
    stateEl.textContent = 'Gagal memuat produk. Silakan coba lagi nanti.';
    console.error(err);
  }
}

initListPage();
