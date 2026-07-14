// 電池欄位格式不一，Sheet 裡可能是 "100%"、裸數字 1 / 0.87、循環次數或 "無"
function formatBattery(raw) {
  const str = String(raw == null ? '' : raw).trim();
  if (!str) return '';
  if (str.indexOf('%') !== -1) return str;
  if (str.indexOf('循環') !== -1) return str.indexOf('次') !== -1 ? str : str + '次';
  const n = Number(str);
  if (!isNaN(n) && str !== '') {
    if (n > 0 && n <= 1) return Math.round(n * 100) + '%';
    if (n > 1 && n <= 100) return Math.round(n) + '%';
  }
  return str;
}

// GAS Web App endpoint 呼叫封裝

async function fetchProductList() {
  const url = CONFIG.GAS_ENDPOINT_URL + '?action=list';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Gagal memuat daftar produk');
  return res.json();
}

async function fetchProductDetail(id) {
  const url = CONFIG.GAS_ENDPOINT_URL + '?action=detail&id=' + encodeURIComponent(id);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Gagal memuat detail produk');
  return res.json();
}

// Fire-and-forget：點擊追蹤不應阻擋使用者導向 WhatsApp，失敗也不影響購買流程
function trackClick(id) {
  const url = CONFIG.GAS_ENDPOINT_URL + '?action=track&id=' + encodeURIComponent(id);
  fetch(url).catch(function () {
    // 追蹤失敗不影響使用者體驗，靜默忽略
  });
}
