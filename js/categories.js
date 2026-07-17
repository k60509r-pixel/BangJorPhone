// 分類導覽選單定義
// 對應《艾薇通訊 印尼語商品型錄網站 UI優化與分類導覽規格書 v1.1》第三節
//
// 每個商品的頂層分類（category: "iphone" / "apple-other" / "android"）
// 由 GAS 依來源分頁直接標記好，不需要前端猜測；
// 第二層子分類則由前端依「型號」欄位字串比對。
//
// 【待確認事項】Android 子選單品牌清單為可擴充結構（見規格書第五節），
// 之後有新品牌只需要在 ANDROID_BRANDS 裡加一筆，不需要動其他邏輯。

function iphoneVariant(model) {
  return String(model || '').replace(/^iPhone\s*/i, '').trim();
}

// 表3-1：iPhone子選單分類（沿用既有BVshop分類邏輯）
// 「iPhone 7 系列」已確認不再進貨銷售，故不列入子選單
const IPHONE_SUBCATEGORIES = [
  { key: 'iphone-8-se', label: 'iPhone 8 / SE', re: /^(8Plus|8|SE3|SE2|SE)$/i },
  { key: 'iphone-x', label: 'iPhone X / XR / Xs', re: /^(XsMax|Xs|XR|X)$/i },
  { key: 'iphone-11', label: 'iPhone 11', re: /^11(Pro|ProMax)?$/i },
  { key: 'iphone-12', label: 'iPhone 12', re: /^12(Pro|ProMax|mini)?$/i },
  { key: 'iphone-13', label: 'iPhone 13', re: /^13(Pro|ProMax|mini)?$/i },
  { key: 'iphone-14', label: 'iPhone 14', re: /^14(Pro|ProMax|Plus)?$/i },
  { key: 'iphone-15', label: 'iPhone 15', re: /^15(Pro|ProMax|Plus)?$/i },
  { key: 'iphone-16', label: 'iPhone 16', re: /^16(Pro|ProMax|Plus)?$/i },
  { key: 'iphone-17', label: 'iPhone 17', re: /^17(Pro|ProMax)?$/i },
];

// Apple其他產品：依產品類型分類
const APPLE_OTHER_SUBCATEGORIES = [
  { key: 'ipad', label: 'iPad', re: /ipad/i },
  { key: 'macbook', label: 'MacBook', re: /macbook/i },
  { key: 'pencil', label: 'Apple Pencil', re: /pencil/i },
];
const APPLE_OTHER_FALLBACK = { key: 'apple-other-lainnya', label: 'Lainnya', re: /.*/ };

// Android：依品牌分類（可擴充，之後有新品牌直接加一筆即可）
const ANDROID_BRANDS = [
  { key: 'samsung', label: 'Samsung', re: /samsung/i },
  { key: 'oppo', label: 'OPPO', re: /oppo/i },
  { key: 'vivo', label: 'Vivo', re: /vivo/i },
  { key: 'google-pixel', label: 'Google Pixel', re: /google|pixel/i },
  { key: 'xiaomi', label: 'Xiaomi', re: /xiaomi|redmi/i },
  { key: 'motorola', label: 'Motorola', re: /motorola/i },
  { key: 'htc', label: 'HTC', re: /htc/i },
];
const ANDROID_FALLBACK = { key: 'android-lainnya', label: 'Lainnya', re: /.*/ };

const CATEGORY_TREE = [
  {
    key: 'iphone',
    label: 'iPhone',
    subcategories: IPHONE_SUBCATEGORIES,
    fallback: null, // 表3-1本身即涵蓋所有現行機型，不需要 catch-all
    matchSub(product, sub) {
      return sub.re.test(iphoneVariant(product.model));
    },
  },
  {
    key: 'apple-other',
    label: 'Produk Apple Lainnya',
    subcategories: APPLE_OTHER_SUBCATEGORIES,
    fallback: APPLE_OTHER_FALLBACK,
    matchSub(product, sub) {
      return sub.re.test(product.model || '');
    },
  },
  {
    key: 'android',
    label: 'Android',
    subcategories: ANDROID_BRANDS,
    fallback: ANDROID_FALLBACK,
    matchSub(product, sub) {
      return sub.re.test(product.model || '');
    },
  },
];

function findTopCategory(key) {
  return CATEGORY_TREE.find(function (c) { return c.key === key; }) || null;
}

// 找出商品在某個頂層分類底下屬於哪個子分類（含 fallback），找不到回傳 null
function resolveSubcategory(topCategory, product) {
  for (var i = 0; i < topCategory.subcategories.length; i++) {
    if (topCategory.matchSub(product, topCategory.subcategories[i])) {
      return topCategory.subcategories[i];
    }
  }
  return topCategory.fallback;
}

// 篩選商品：topKey 必填，subKey 可省略（省略＝該頂層分類下的全部商品）
function filterProducts(products, topKey, subKey) {
  const topCategory = findTopCategory(topKey);
  if (!topCategory) return [];
  return products.filter(function (p) {
    if (p.category !== topKey) return false;
    if (!subKey) return true;
    const sub = resolveSubcategory(topCategory, p);
    return sub && sub.key === subKey;
  });
}

// 表3-2：保固天數對照表（對應《詳情頁優化與保固顯示 v1.2 執行書》第三節）
// 沿用同一套機型分類邏輯（IPHONE_SUBCATEGORIES），保固/導覽選單/更多款式三處共用一份規則
const IPHONE_WARRANTY_DAYS = {
  'iphone-8-se': 90,
  'iphone-x': 90,
  'iphone-11': 180,
  'iphone-12': 180,
  'iphone-13': 180,
  'iphone-14': 180,
  'iphone-15': 180,
  'iphone-16': 180,
  'iphone-17': 180,
};
const NON_IPHONE_WARRANTY_DAYS = 90; // Apple其他產品、Android 一律 90 天

// 依商品所屬機型分類回傳保固天數，找不到分類時回傳 null（畫面上不顯示該列）
function getWarrantyDays(product) {
  const topCategory = findTopCategory(product.category);
  if (!topCategory) return null;
  if (topCategory.key !== 'iphone') return NON_IPHONE_WARRANTY_DAYS;
  const sub = resolveSubcategory(topCategory, product);
  return sub ? (IPHONE_WARRANTY_DAYS[sub.key] || null) : null;
}

// 找出與 product 同一機型系列（同頂層分類＋同子分類）的其他在庫商品，供詳情頁「更多款式」使用
function getSameSeriesProducts(products, product) {
  const topCategory = findTopCategory(product.category);
  if (!topCategory) return [];
  const targetSub = resolveSubcategory(topCategory, product);
  const targetSubKey = targetSub ? targetSub.key : null;
  return products.filter(function (p) {
    if (p.id === product.id) return false;
    if (p.category !== product.category) return false;
    const sub = resolveSubcategory(topCategory, p);
    return (sub ? sub.key : null) === targetSubKey;
  });
}
