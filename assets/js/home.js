let currentCategory = 'all';
let searchKeyword = '';

function renderCategories() {
  const container = document.getElementById('category-tabs');
  container.innerHTML = CATEGORIES.map(cat => `
    <button class="cat-tab ${cat.id === currentCategory ? 'active' : ''}" data-cat="${cat.id}">
      ${cat.name}
    </button>
  `).join('');
  
  container.querySelectorAll('.cat-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.cat;
      renderCategories();
      renderTools();
    });
  });
}

function renderTools() {
  const grid = document.getElementById('tools-grid');
  
  let filtered = TOOLS_DATA.filter(tool => {
    const matchCat = currentCategory === 'all' || tool.category === currentCategory;
    const matchSearch = !searchKeyword || 
                        tool.name.toLowerCase().includes(searchKeyword) || 
                        tool.desc.toLowerCase().includes(searchKeyword);
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
  
  grid.innerHTML = filtered.map((tool, idx) => {
    if (tool.status === 'coming') {
      return `
        <div class="tool-card disabled">
          <div class="tool-icon">${tool.icon}</div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xl font-semibold text-[--ink]">${tool.name}</h3>
            <span class="tool-num">···</span>
          </div>
          <p class="text-sm text-[--ink-soft] leading-relaxed mb-6">${tool.desc}</p>
          <div class="flex items-center gap-2 text-xs text-[--muted] font-medium">
            <span>敬请期待</span>
          </div>
        </div>
      `;
    }
    return `
      <a href="tools/${tool.id}.html" class="tool-card block no-underline text-inherit">
        <div class="tool-icon">${tool.icon}</div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-xl font-semibold text-[--ink]">${tool.name}</h3>
          <span class="tool-num">${String(idx + 1).padStart(2, '0')}</span>
        </div>
        <p class="text-sm text-[--ink-soft] leading-relaxed mb-6">${tool.desc}</p>
        <div class="flex items-center gap-2 text-xs text-[--green] font-medium">
          <span>进入工具</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7H11M11 7L7 3M11 7L7 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </a>
    `;
  }).join('');
}

document.getElementById('search-input').addEventListener('input', (e) => {
  searchKeyword = e.target.value.toLowerCase().trim();
  renderTools();
});

// 初始化
renderCategories();
renderTools();
