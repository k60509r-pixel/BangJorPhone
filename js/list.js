// formatPrice / escapeHtml / renderProductCard 已搬到 js/render.js（與詳情頁「更多款式」共用）

// ===== 分類導覽選單（accordion）與篩選狀態 =====
// 對應《UI優化與分類導覽規格書 v1.1》第三節

let allProducts = [];
let activeFilter = null; // { topKey, subKey } 或 null（顯示全部）

function buildCategoryNav() {
  const nav = document.getElementById('category-nav');
  nav.innerHTML = '';

  CATEGORY_TREE.forEach(function (topCategory) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'category-toggle';
    toggle.textContent = topCategory.label;
    toggle.dataset.top = topCategory.key;

    const panel = document.createElement('div');
    panel.className = 'subcategory-panel';
    panel.hidden = true;

    // 子選單一律列出全部（含 fallback「Lainnya」），不因庫存為零而隱藏
    const subs = topCategory.subcategories.concat(topCategory.fallback ? [topCategory.fallback] : []);
    subs.forEach(function (sub) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'subcategory-chip';
      chip.textContent = sub.label;
      chip.dataset.top = topCategory.key;
      chip.dataset.sub = sub.key;
      chip.addEventListener('click', function () {
        applyFilter(topCategory.key, sub.key);
      });
      panel.appendChild(chip);
    });

    toggle.addEventListener('click', function () {
      const isOpen = !panel.hidden;
      // 手風琴效果：點別的分類時收起其他已展開的子選單
      nav.querySelectorAll('.subcategory-panel').forEach(function (p) { p.hidden = true; });
      nav.querySelectorAll('.category-toggle').forEach(function (t) { t.classList.remove('open'); });
      if (!isOpen) {
        panel.hidden = false;
        toggle.classList.add('open');
      }
      // 點頂層分類本身＝篩選該分類下的全部商品
      applyFilter(topCategory.key, null);
    });

    nav.appendChild(toggle);
    nav.appendChild(panel);
  });
}

function updateActiveStates() {
  const nav = document.getElementById('category-nav');
  nav.querySelectorAll('.category-toggle').forEach(function (t) {
    t.classList.toggle('active', !!activeFilter && activeFilter.topKey === t.dataset.top);
  });
  nav.querySelectorAll('.subcategory-chip').forEach(function (c) {
    const match = !!activeFilter && activeFilter.topKey === c.dataset.top && activeFilter.subKey === c.dataset.sub;
    c.classList.toggle('active', match);
  });
}

function applyFilter(topKey, subKey) {
  activeFilter = { topKey: topKey, subKey: subKey };
  updateActiveStates();
  renderFilterStatus();
  renderGrid();
}

function clearFilter() {
  activeFilter = null;
  const nav = document.getElementById('category-nav');
  nav.querySelectorAll('.subcategory-panel').forEach(function (p) { p.hidden = true; });
  nav.querySelectorAll('.category-toggle').forEach(function (t) { t.classList.remove('open'); });
  updateActiveStates();
  renderFilterStatus();
  renderGrid();
}

function currentFilterLabel() {
  if (!activeFilter) return '';
  const topCategory = findTopCategory(activeFilter.topKey);
  if (!topCategory) return '';
  if (!activeFilter.subKey) return topCategory.label;
  const subs = topCategory.subcategories.concat(topCategory.fallback ? [topCategory.fallback] : []);
  const sub = subs.find(function (s) { return s.key === activeFilter.subKey; });
  return sub ? topCategory.label + ' - ' + sub.label : topCategory.label;
}

function renderFilterStatus() {
  const bar = document.getElementById('filter-status');
  const text = document.getElementById('filter-status-text');
  if (!activeFilter) {
    bar.hidden = true;
    return;
  }
  bar.hidden = false;
  text.textContent = 'Menampilkan: ' + currentFilterLabel();
}

function renderGrid() {
  const grid = document.getElementById('product-grid');
  const emptyMsg = document.getElementById('empty-category-message');
  grid.innerHTML = '';

  const products = activeFilter
    ? filterProducts(allProducts, activeFilter.topKey, activeFilter.subKey)
    : allProducts;

  if (products.length === 0) {
    emptyMsg.hidden = false;
    return;
  }
  emptyMsg.hidden = true;
  products.forEach(function (product) {
    grid.appendChild(renderProductCard(product));
  });
}

async function initListPage() {
  const stateEl = document.getElementById('state-message');
  const nav = document.getElementById('category-nav');
  try {
    allProducts = await fetchProductList();
    if (!allProducts || allProducts.length === 0) {
      stateEl.textContent = 'Belum ada produk tersedia saat ini.';
      nav.hidden = true;
      return;
    }
    stateEl.style.display = 'none';
    buildCategoryNav();
    document.getElementById('clear-filter-btn').addEventListener('click', clearFilter);
    renderGrid();
  } catch (err) {
    stateEl.textContent = 'Gagal memuat produk. Silakan coba lagi nanti.';
    console.error(err);
  }
}

initListPage();
