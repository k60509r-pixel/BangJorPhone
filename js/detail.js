// formatPrice / escapeHtml / renderProductCard 來自 js/render.js

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

// ===== 商品照片＋影片輪播（對應《詳情頁優化與保固顯示 v1.2》第二節） =====
// 影片改用原生 <video muted> 直連播放（非 Drive 預覽 iframe），
// 確保「鎖定靜音、不提供解除靜音選項」且不會與輪播的橫向滑動手勢互相干擾。
function renderMediaCarousel(product) {
  const wrap = document.getElementById('media-carousel-wrap');
  const carousel = document.getElementById('media-carousel');
  const indicator = document.getElementById('media-indicator');
  carousel.innerHTML = '';

  const photos = product.photos || [];
  const hasVideo = !!product.videoUrl;
  const total = photos.length + (hasVideo ? 1 : 0);

  if (total === 0) {
    wrap.style.display = 'none';
    return;
  }

  photos.forEach(function (url) {
    const slide = document.createElement('div');
    slide.className = 'media-slide';
    const img = document.createElement('img');
    img.src = url;
    img.loading = 'lazy';
    img.alt = product.model || '';
    slide.appendChild(img);
    carousel.appendChild(slide);
  });

  let video = null;
  let videoSlide = null;
  if (hasVideo) {
    videoSlide = document.createElement('div');
    videoSlide.className = 'media-slide video-slide';

    video = document.createElement('video');
    video.src = product.videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.preload = 'metadata';

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'video-play-btn';
    playBtn.setAttribute('aria-label', 'Putar video');
    playBtn.addEventListener('click', function () {
      video.play();
      videoSlide.classList.add('playing');
    });

    videoSlide.appendChild(video);
    videoSlide.appendChild(playBtn);
    carousel.appendChild(videoSlide);
  }

  if (total <= 1) {
    indicator.hidden = true;
  } else {
    indicator.hidden = false;
    const videoIndex = total - 1; // 影片固定在輪播最後一格
    const updateIndicator = function () {
      const index = Math.max(0, Math.min(total - 1, Math.round(carousel.scrollLeft / carousel.clientWidth)));
      indicator.textContent = (index + 1) + ' / ' + total;
      if (video && index !== videoIndex) {
        video.pause();
        videoSlide.classList.remove('playing');
      }
    };
    carousel.addEventListener('scroll', function () {
      window.requestAnimationFrame(updateIndicator);
    });
    updateIndicator();
  }
}

function renderDetail(product) {
  document.title = (product.model || 'Produk') + ' - BangJorPhone';

  renderMediaCarousel(product);

  document.getElementById('detail-model').textContent = product.model || '';
  document.getElementById('detail-price').textContent = formatPrice(product.price);

  const warrantyDays = getWarrantyDays(product);
  const rows = [
    ['Kapasitas', product.capacity],
    ['Warna', product.color],
    ['Baterai', formatBattery(product.battery)],
    ['Riwayat servis / cacat', product.repairNote],
    ['Kondisi tampilan', product.appearance],
    ['Kelengkapan (dus)', product.accessories],
    ['Lokasi toko', product.store],
  ];
  if (warrantyDays) {
    rows.splice(3, 0, ['Garansi', warrantyDays + ' hari']);
  }
  const tbody = document.getElementById('spec-body');
  tbody.innerHTML = '';
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

// ===== 更多款式（對應《詳情頁優化與保固顯示 v1.2》第四節） =====
// 同分類無其他在庫商品時，此區塊整個不顯示（不同於 v1.1 導覽選單的「缺貨提示文字」邏輯）
function renderRelated(product, allProducts) {
  const section = document.getElementById('related-products');
  const grid = document.getElementById('related-grid');
  const related = getSameSeriesProducts(allProducts, product);
  if (related.length === 0) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  grid.innerHTML = '';
  related.forEach(function (p) {
    grid.appendChild(renderProductCard(p));
  });
}

async function initDetailPage() {
  const stateEl = document.getElementById('state-message');
  const id = getIdFromUrl();
  if (!id) {
    stateEl.textContent = 'Produk tidak ditemukan.';
    return;
  }
  try {
    const allProducts = await fetchAllProducts();
    const targetId = normalizeProductId(id);
    const product = allProducts.find(function (p) { return normalizeProductId(p.id) === targetId; }) || null;
    if (!product || product.error) {
      stateEl.textContent = 'Produk tidak ditemukan atau sudah terjual.';
      return;
    }
    stateEl.style.display = 'none';
    document.getElementById('detail-content').style.display = 'block';
    renderDetail(product);
    renderRelated(product, allProducts);
  } catch (err) {
    stateEl.textContent = 'Gagal memuat produk. Silakan coba lagi nanti.';
    console.error(err);
  }
}

initDetailPage();
