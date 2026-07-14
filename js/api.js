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

// 商品資料改讀 GAS 定期發布出來的靜態 JSON（跟網站放在同一個 repo），
// 瀏覽時不再即時呼叫 GAS，載入速度快很多。
// cache: 'no-store' 是為了避免瀏覽器快取住舊的庫存狀態（例如已售出的商品）。
const CATALOG_DATA_URL = 'data/products.json';

let _allProductsPromise = null;

function fetchAllProducts() {
  if (!_allProductsPromise) {
    _allProductsPromise = fetch(CATALOG_DATA_URL, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('Gagal memuat data produk');
        return res.json();
      })
      .catch(function (err) {
        _allProductsPromise = null; // 失敗時允許重試
        throw err;
      });
  }
  return _allProductsPromise;
}

async function fetchProductList() {
  return fetchAllProducts();
}

async function fetchProductDetail(id) {
  const products = await fetchAllProducts();
  const targetId = String(id).trim();
  return products.find(function (p) { return String(p.id).trim() === targetId; }) || null;
}

// 點擊追蹤還是即時打 GAS（唯一還需要即時串接的功能）

// Fire-and-forget：點擊追蹤不應阻擋使用者導向 WhatsApp，失敗也不影響購買流程
function trackClick(id) {
  const url = CONFIG.GAS_ENDPOINT_URL + '?action=track&id=' + encodeURIComponent(id);
  fetch(url).catch(function () {
    // 追蹤失敗不影響使用者體驗，靜默忽略
  });
}
