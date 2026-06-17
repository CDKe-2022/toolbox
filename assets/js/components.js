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
// 1. ToolButton
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
// 2. InfoCard
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
// 3. DropZone (修复文件校验逻辑)
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
    
    // 修复后的文件校验逻辑
    const validateFiles = (files) => {
      if (!accept || accept === '*/*') return true;
      const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
      for (const file of files) {
        const fileName = file.name.toLowerCase();
        const fileType = file.type.toLowerCase();
        const isValid = acceptedTypes.some(type => {
          if (type.endsWith('/*')) return fileType.startsWith(type.slice(0, -1));
          if (type.startsWith('.')) return fileName.endsWith(type);
          if (fileType === type) return true;
          if (type === 'image/*' && fileType.startsWith('image/')) return true;
          return false;
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
    const name = escapeHtml(this.getAttribute('name') || '');
    const desc = escapeHtml(this.getAttribute('desc') || '');
    const href = this.getAttribute('href');
    
    this.classList.toggle('disabled', status === 'coming');
    this.classList.add('tool-card');
    
    if (href && status !== 'coming') {
      this.dataset.href = href;
    } else {
      delete this.dataset.href;
    }
    
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
    
    if (this._iconNode) {
      const iconContainer = this.querySelector('.tool-icon');
      if (iconContainer) {
        iconContainer.appendChild(this._iconNode);
      }
    }
  }
}
customElements.define('tool-card', ToolCard);

// ToolCard 全局事件代理
document.addEventListener('click', (e) => {
  const card = e.target.closest('tool-card');
  if (!card) return;
  const href = card.dataset.href;
  if (href) {
    e.preventDefault();
    window.location.href = href;
  }
});

// ==========================================
// 5. 页面级通用组件 (从 HTML 内联提取，便于全局复用)
// ==========================================

class ToolHeader extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute('title') || '工具';
    const toolId = this.getAttribute('tool-id') || '00';
    this.innerHTML = `
      <header class="flex items-center justify-between mb-8 md:mb-12">
        <div class="flex items-center gap-4">
          <tool-button variant="ghost" onclick="goHome()" class="shrink-0">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            返回主页
          </tool-button>
          <div class="h-6 w-px bg-[--border] hidden sm:block"></div>
          <div class="hidden sm:flex items-center gap-2 text-sm text-[--muted]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span>${title}</span>
          </div>
        </div>
        <span class="tool-num bg-[--green]/10 text-[--green] px-3 py-1 rounded-full">Tool ${toolId}</span>
      </header>
    `;
  }
}
customElements.define('tool-header', ToolHeader);

class ListHeader extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute('title') || '列表';
    const countId = this.getAttribute('count-id') || '';
    const actionId = this.getAttribute('action-id') || '';
    const actionText = this.getAttribute('action-text') || '操作';
    const hint = this.getAttribute('hint') || '';
    this.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label class="text-base font-medium text-[--ink]">
            ${title} <span id="${countId}" class="text-[--muted] ml-1"></span>
          </label>
          ${hint ? `<p class="text-sm text-[--muted] mt-1">${hint}</p>` : ''}
        </div>
        <tool-button id="${actionId}" variant="ghost" class="shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          ${actionText}
        </tool-button>
      </div>
    `;
  }
}
customElements.define('list-header', ListHeader);

class SettingGroup extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute('title') || '设置';
    const id = this.getAttribute('id') || '';
    const hint = this.getAttribute('hint') || '';
    this.innerHTML = `
      <div class="space-y-3">
        <label class="block text-sm font-medium text-[--ink-soft]">
          ${title} ${hint ? `<span class="text-xs text-[--muted] font-normal">${hint}</span>` : ''}
        </label>
        <div class="space-y-2" id="${id}"></div>
      </div>
    `;
  }
}
customElements.define('setting-group', SettingGroup);

class OptionCard extends HTMLElement {
  static get observedAttributes() { return ['active', 'value', 'title', 'desc']; }
  
  connectedCallback() {
    this.render();
  }
  
  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }
  
  render() {
    const active = this.hasAttribute('active');
    const value = this.getAttribute('value') || '';
    const title = this.getAttribute('title') || '';
    const desc = this.getAttribute('desc') || '';
    
    this.className = 'orient-option' + (active ? ' active' : '');
    this.innerHTML = `
      <div class="font-medium">${title}</div>
      <div class="text-xs opacity-75 mt-0.5">${desc}</div>
    `;
    this.dataset.value = value;
  }
}
customElements.define('option-card', OptionCard);
