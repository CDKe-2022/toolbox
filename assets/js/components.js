// ==========================================
// 通用工具函数：防止 XSS
// ==========================================
function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ==========================================
// 1. ToolButton (基本合格，保持原样)
// ==========================================
class ToolButton extends HTMLElement {
  static get observedAttributes() { return ['disabled', 'variant', 'size']; }
  
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;
    this.classList.add('btn');
    this.updateVariant();
    this.updateSize();
    
    this.addEventListener('click', (e) => {
      if (this.hasAttribute('disabled')) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }
  
  updateVariant() {
    const variant = this.getAttribute('variant') || 'primary';
    ['primary', 'ghost', 'accent'].forEach(v => this.classList.remove(`btn-${v}`));
    this.classList.add(`btn-${variant}`);
  }
  
  updateSize() {
    const size = this.getAttribute('size') || 'md';
    ['sm', 'md', 'lg'].forEach(s => this.classList.remove(`btn-${s}`));
    this.classList.add(`btn-${size}`);
  }
  
  attributeChangedCallback(name) {
    if (name === 'variant') this.updateVariant();
    if (name === 'size') this.updateSize();
    if (name === 'disabled') this.classList.toggle('disabled', this.hasAttribute('disabled'));
  }
}
customElements.define('tool-button', ToolButton);

// ==========================================
// 2. InfoCard (优化：支持属性局部更新)
// ==========================================
class InfoCard extends HTMLElement {
  static get observedAttributes() { return ['title']; }
  
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;
    this.classList.add('info-card', 'mt-12');
    const content = this.innerHTML;
    this.innerHTML = `
      <h4 class="text-sm font-semibold text-[--green] mb-3 flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.3"/>
          <path d="M7 4V7.5M7 9.5V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span class="info-title">${escapeHtml(this.getAttribute('title') || '说明')}</span>
      </h4>
      <ul class="text-xs text-[--ink-soft] space-y-1.5 leading-relaxed">${content}</ul>
    `;
  }
  
  attributeChangedCallback(name) {
    if (name === 'title' && this.isConnected) {
      const titleEl = this.querySelector('.info-title');
      if (titleEl) {
        titleEl.textContent = this.getAttribute('title') || '说明';
      }
    }
  }
}
customElements.define('info-card', InfoCard);

// ==========================================
// 3. DropZone (优化：增加文件类型校验)
// ==========================================
class DropZone extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;
    const text = this.getAttribute('text') || '点击或拖拽文件到此处';
    const hint = this.getAttribute('hint') || '';
    const accept = this.getAttribute('accept') || '*/*';
    const multiple = this.hasAttribute('multiple') ? 'multiple' : '';
    
    this.classList.add('drop-zone');
    this.innerHTML = `
      <input type="file" class="hidden" ${multiple} accept="${accept}">
      <div class="tool-icon mx-auto mb-4" style="width:52px;height:52px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 16V4M12 4L7 9M12 4L17 9M5 20H19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <p class="font-medium text-[--ink] mb-1 text-base">${text}</p>
      <p class="text-xs text-[--muted]">${hint}</p>
    `;
    
    const input = this.querySelector('input');
    
    // 提取文件校验逻辑
    const validateFiles = (files) => {
      if (accept === '*/*' || !accept) return true;
      const acceptedTypes = accept.split(',').map(t => t.trim());
      for (const file of files) {
        const isValid = acceptedTypes.some(type => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.slice(0, -1));
          }
          return file.type === type || file.name.endsWith(type);
        });
        if (!isValid) return false;
      }
      return true;
    };
    
    const handleFiles = (files) => {
      if (validateFiles(files)) {
        this.dispatchEvent(new CustomEvent('files-selected', { detail: files }));
      } else {
        this.dispatchEvent(new CustomEvent('file-error', { detail: '文件类型不被允许' }));
      }
    };

    this.addEventListener('click', () => input.click());
    this.addEventListener('dragover', (e) => {
      e.preventDefault(); e.stopPropagation();
      this.classList.add('dragover');
    });
    this.addEventListener('dragleave', (e) => {
      e.preventDefault(); e.stopPropagation();
      this.classList.remove('dragover');
    });
    this.addEventListener('drop', (e) => {
      e.preventDefault(); e.stopPropagation();
      this.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    });
    input.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    });
  }
  
  // 占位：浏览器会自动回收绑定在 this 上的事件监听器
  disconnectedCallback() {}
}
customElements.define('drop-zone', DropZone);

// ==========================================
// 4. ToolCard (彻底重构：响应式 + 防注入 + 去重 + 性能优化)
// ==========================================
class ToolCard extends HTMLElement {
  static get observedAttributes() {
    return ['status', 'num', 'name', 'desc', 'href'];
  }
  
  connectedCallback() {
    // 🔧 第五刀：缓存 icon 节点，避免每次 render 重新解析 SVG
    if (!this._iconCached) {
      this._iconNode = this.firstElementChild?.cloneNode(true);
      this._iconCached = true;
    }
    this.render();
  }
  
  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }
  
  render() {
    const status = this.getAttribute('status') || 'active';
    const num = escapeHtml(this.getAttribute('num') || '···');
    // 🔧 第二刀：使用 escapeHtml 防止 XSS 注入
    const name = escapeHtml(this.getAttribute('name') || '');
    const desc = escapeHtml(this.getAttribute('desc') || '');
    const href = this.getAttribute('href');
    
    // 动态切换样式类，而不是覆盖全部 class
    this.classList.toggle('disabled', status === 'coming');
    this.classList.add('tool-card');
    
    // 🔧 第一刀：将 href 存入 dataset，移除组件内部的事件绑定
    if (href && status !== 'coming') {
      this.dataset.href = href;
    } else {
      delete this.dataset.href;
    }
    
    // 🔧 第四刀：合并重复模板
    const isComing = status === 'coming';
    const actionHtml = isComing 
      ? `<span>敬请期待</span>`
      : `<span>进入工具</span>
         <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
           <path d="M3 7H11M11 7L7 3M11 7L7 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>`;
         
    const actionClass = isComing ? 'text-[--muted]' : 'text-[--green]';
    
    this.innerHTML = `
      <div class="tool-icon"></div>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xl font-semibold text-[--ink]">${name}</h3>
        <span class="tool-num">${num}</span>
      </div>
      <p class="text-sm text-[--ink-soft] leading-relaxed mb-6">${desc}</p>
      <div class="flex items-center gap-2 text-xs font-medium ${actionClass}">
        ${actionHtml}
      </div>
    `;
    
    // 插入缓存的 Icon 节点
    if (this._iconNode) {
      const iconContainer = this.querySelector('.tool-icon');
      if (iconContainer) {
        iconContainer.appendChild(this._iconNode);
      }
    }
  }
}
customElements.define('tool-card', ToolCard);

// ==========================================
// 🔧 第一刀补充：全局事件委托
// 100个卡片只注册1个监听器，提升性能
// ==========================================
document.addEventListener('click', (e) => {
  const card = e.target.closest('tool-card');
  if (!card) return;
  
  const href = card.dataset.href;
  if (href) {
    e.preventDefault();
    window.location.href = href;
  }
});
