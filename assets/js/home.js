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
  
  // 直接生成 <tool-card> 标签，组件会自动处理内部结构和样式
  grid.innerHTML = filtered.map((tool, idx) => {
    return `
      <tool-card 
        href="tools/${tool.id}.html" 
        status="${tool.status}" 
        num="${String(idx + 1).padStart(2, '0')}" 
        name="${tool.name}" 
        desc="${tool.desc}">
        ${tool.icon}
      </tool-card>
    `;
  }).join('');
}

document.getElementById('search-input').addEventListener('input', (e) => {
  searchKeyword = e.target.value.toLowerCase().trim();
  renderTools();
});

renderCategories();
renderTools();
