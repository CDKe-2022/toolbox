// assets/js/home.js
class HomePage {
  constructor() {
    this.currentCategory = '全部';
    this.searchTerm = '';
    this.init();
  }
  
  init() {
    this.setupSearch();
    this.renderCategories();
    this.renderTools();
    this.updateToolCount();
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
      }
    });
  }
  
  setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.renderTools();
      });
    }
  }
  
  renderCategories() {
    const container = document.getElementById('categories-container');
    container.innerHTML = '';
    
    window.toolData.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'cat-tab' + (cat === this.currentCategory ? ' active' : '');
      btn.textContent = cat;
      btn.onclick = () => {
        this.currentCategory = cat;
        this.renderCategories();
        this.renderTools();
      };
      container.appendChild(btn);
    });
  }
  
  renderTools() {
    const grid = document.getElementById('tools-grid');
    grid.innerHTML = '';
    
    let filteredTools = this.currentCategory === '全部' 
      ? window.toolData.tools 
      : window.toolData.tools.filter(t => t.category === this.currentCategory);
    
    // 应用搜索过滤
    if (this.searchTerm) {
      filteredTools = filteredTools.filter(tool => 
        tool.name.toLowerCase().includes(this.searchTerm) ||
        tool.desc.toLowerCase().includes(this.searchTerm) ||
        tool.category.toLowerCase().includes(this.searchTerm) ||
        tool.keywords.some(keyword => keyword.toLowerCase().includes(this.searchTerm))
      );
    }
    
    filteredTools.forEach(tool => {
      const card = document.createElement('tool-card');
      card.setAttribute('num', tool.num);
      card.setAttribute('name', tool.name);
      card.setAttribute('desc', tool.desc);
      card.setAttribute('href', tool.href);  // 确保设置 href 属性
      card.setAttribute('status', tool.status);
      card.innerHTML = tool.icon;
      grid.appendChild(card);
    });
  }
  
  updateToolCount() {
    document.getElementById('tool-count').textContent = window.toolData.tools.length;
  }
}
