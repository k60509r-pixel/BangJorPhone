function formatPrice(price) {
  const n = Number(price);
  if (isNaN(n)) return price;
  return 'NT$' + n.toLocaleString('en-US');
}

function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function buildWhatsAppUrl(product) {
  // product.id 本身已含 "#"（例如 "#5324"），不需要再另外補一個
  const text = 'Saya tertarik dengan ' + product.id + ' ' +
    [product.model, product.capacity, product.color].filter(Boolean).join(' ') +
    ' - ' + formatPrice(product.price);
  return 'https://wa.me/' + CONFIG.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
}

function renderDetail(product) {
  document.title = (product.model || 'Produk') + ' - BangJorPhone';

  const gallery = document.getElementById('photo-gallery');
  (product.photos || []).forEach(function (url) {
    const img = document.createElement('img');
    img.src = url;
    img.loading = 'lazy';
    img.alt = product.model || '';
    gallery.appendChild(img);
  });

  if (product.videoEmbedUrl) {
    const videoWrap = document.getElementById('video-wrap');
    videoWrap.style.display = 'block';
    const iframe = document.createElement('iframe');
    iframe.src = product.videoEmbedUrl;
    iframe.allow = 'autoplay';
    iframe.allowFullscreen = true;
    videoWrap.appendChild(iframe);
  }

  document.getElementById('detail-model').textContent = product.model || '';
  document.getElementById('detail-price').textContent = formatPrice(product.price);

  const rows = [
    ['Kapasitas', product.capacity],
    ['Warna', product.color],
    ['Baterai', formatBattery(product.battery)],
    ['Riwayat servis / cacat', product.repairNote],
    ['Kondisi tampilan', product.appearance],
    ['Kelengkapan (dus)', product.accessories],
    ['Lokasi toko', product.store],
  ];
  const tbody = document.getElementById('spec-body');
  rows.forEach(function (row) {
    const tr = document.createElement('tr');
    const label = document.createElement('td');
    label.textContent = row[0];
    const value = document.createElement('td');
    value.textContent = row[1] || '-';
    tr.appendChild(label);
    tr.appendChild(value);
    tbody.appendChild(tr);
  });

  const buyButton = document.getElementById('buy-button');
  buyButton.href = buildWhatsAppUrl(product);
  buyButton.addEventListener('click', function () {
    trackClick(product.id);
  });
  document.getElementById('buy-bar').style.display = 'flex';
}

async function initDetailPage() {
  const stateEl = document.getElementById('state-message');
  const id = getIdFromUrl();
  if (!id) {
    stateEl.textContent = 'Produk tidak ditemukan.';
    return;
  }
  try {
    const product = await fetchProductDetail(id);
    if (!product || product.error) {
      stateEl.textContent = 'Produk tidak ditemukan atau sudah terjual.';
      return;
    }
    stateEl.style.display = 'none';
    document.getElementById('detail-content').style.display = 'block';
    renderDetail(product);
  } catch (err) {
    stateEl.textContent = 'Gagal memuat produk. Silakan coba lagi nanti.';
    console.error(err);
  }
}

initDetailPage();
