// ==========================================
// 状态集中管理 (第五处问题优化)
// ==========================================
const state = {
  category: 'all',
  keyword: ''
};

// 数据容错与校验 (第三处问题优化)
if (!Array.isArray(TOOLS_DATA) || !Array.isArray(CATEGORIES)) {
  console.error('Tools data or categories missing');
  // 实际项目中可以在这里渲染一个全局的错误提示 UI
}

// ==========================================
// 分类渲染与事件代理 (第五处问题优化)
// ==========================================
function renderCategories() {
  const container = document.getElementById('category-tabs');
  
  // 初始化只渲染一次
  container.innerHTML = CATEGORIES.map(cat => `
    <button class="cat-tab ${cat.id === state.category ? 'active' : ''}" data-cat="${cat.id}">
      ${cat.name}
    </button>
  `).join('');
  
  // 使用事件代理，避免给每个按钮绑定事件
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-tab');
    if (!btn) return;
    
    const catId = btn.dataset.cat;
    if (catId === state.category) return; // 相同分类不重复触发
    
    // 只更新 active 状态，不重建 DOM
    container.querySelector('.cat-tab.active')?.classList.remove('active');
    btn.classList.add('active');
    
    state.category = catId;
    renderTools();
  });
}

// ==========================================
// 工具列表渲染
// ==========================================
function renderTools() {
  const grid = document.getElementById('tools-grid');
  let filtered = TOOLS_DATA.filter(tool => {
    const matchCat = state.category === 'all' || tool.category === state.category;
    
    // 数据容错处理 (第二处问题优化)
    const matchSearch = !state.keyword || 
                        (tool.name || '').toLowerCase().includes(state.keyword) || 
                        (tool.desc || '').toLowerCase().includes(state.keyword);
    return matchCat && matchSearch;
  });
  
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16 text-[--muted]">
        <p class="text-lg mb-2">没有找到匹配的工具</p>
        <p class="text-sm">试试其他关键词，或者这个工具还在开发中</p>
      </div>
    `;
    return;
  }
  
  // 使用 DocumentFragment 和 DOM API 构建 (第四处问题优化)
  const fragment = document.createDocumentFragment();
  filtered.forEach((tool, idx) => {
    const card = document.createElement('tool-card');
    card.setAttribute('href', `tools/${tool.id}.html`);
    card.setAttribute('status', tool.status);
    card.setAttribute('num', String(idx + 1).padStart(2, '0'));
    card.setAttribute('name', tool.name || '');
    card.setAttribute('desc', tool.desc || '');
    card.innerHTML = tool.icon; // 保留原有的 icon 插入方式
    
    fragment.appendChild(card);
  });
  
  // 一次性替换，减少重排
  grid.innerHTML = '';
  grid.appendChild(fragment);
}

// ==========================================
// 搜索防抖 (第一处问题优化)
// ==========================================
let searchTimer;
document.getElementById('search-input').addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.keyword = e.target.value.toLowerCase().trim();
    renderTools();
  }, 150); // 150ms 防抖延迟
});

// 初始化执行
renderCategories();
renderTools();
