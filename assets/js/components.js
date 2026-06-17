// 自定义组件定义
class ToolCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        :host {
          display: block;
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        :host(:hover) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
        
        .card-header {
          padding: 16px;
          background: var(--bg-2);
          border-bottom: 1px solid var(--border);
        }
        
        .card-icon {
          width: 32px;
          height: 32px;
          margin-bottom: 8px;
        }
        
        .card-title {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 4px;
        }
        
        .card-desc {
          font-size: 14px;
          color: var(--ink-soft);
          line-height: 1.4;
        }
        
        .card-footer {
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border);
        }
        
        .card-status {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 4px;
        }
        
        .status-active {
          background: var(--green-light);
          color: var(--green);
        }
      </style>
      
      <div class="card-header">
        <div class="card-icon" id="card-icon"></div>
        <div class="card-title" id="card-title"></div>
        <div class="card-desc" id="card-desc"></div>
      </div>
      
      <div class="card-footer">
        <tool-button variant="primary" id="card-button">
          开始使用
        </tool-button>
        <span class="card-status status-active" id="card-status">活跃</span>
      </div>
    `;
    
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    const icon = this.getAttribute('icon');
    const title = this.getAttribute('name');
    const desc = this.getAttribute('desc');
    const href = this.getAttribute('href');
    const status = this.getAttribute('status');
    
    this.shadowRoot.getElementById('card-icon').innerHTML = icon;
    this.shadowRoot.getElementById('card-title').textContent = title;
    this.shadowRoot.getElementById('card-desc').textContent = desc;
    this.shadowRoot.getElementById('card-status').textContent = status;
    
    const button = this.shadowRoot.getElementById('card-button');
    button.onclick = () => {
      window.location.href = href;
    };
  }
}

class ToolButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        
        :host([variant="primary"]) {
          background: var(--green);
          color: white;
        }
        
        :host([variant="primary"]:hover) {
          background: #14532d;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(20, 83, 45, 0.2);
        }
        
        :host([variant="ghost"]) {
          background: transparent;
          color: var(--ink-soft);
          border: 1px solid var(--border);
        }
        
        :host([variant="ghost"]:hover) {
          background: var(--bg-2);
          color: var(--ink);
        }
        
        :host([variant="accent"]) {
          background: var(--accent);
          color: white;
        }
        
        :host([variant="accent"]:hover) {
          background: #111827;
        }
        
        :host([size="sm"]) {
          padding: 6px 12px;
          font-size: 12px;
        }
        
        :host(:disabled) {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        :host(:disabled) svg {
          animation: spin 1s linear infinite;
        }
        
        svg {
          width: 16px;
          height: 16px;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
      <slot></slot>
    `;
    
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

class DropZone extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        :host {
          border: 2px dashed var(--border);
          border-radius: 12px;
          padding: 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--bg-2);
        }
        
        :host(:hover) {
          border-color: var(--green);
          background: var(--green-light);
        }
        
        :host(.dragover) {
          border-color: var(--green);
          background: var(--green-light);
        }
        
        .tool-icon {
          color: var(--green);
          margin-bottom: 1rem;
        }
        
        input[type="file"] {
          display: none;
        }
      </style>
      
      <div class="tool-icon" id="tool-icon">
        <slot name="icon"></slot>
      </div>
      <p class="font-medium text-[--ink] mb-1" id="drop-text"></p>
      <p class="text-xs text-[--muted]" id="drop-hint"></p>
      <input type="file" id="file-input">
    `;
    
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
  
  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }
  
  render() {
    const text = this.getAttribute('text') || '点击或拖拽文件到此处';
    const hint = this.getAttribute('hint') || '支持 .pdf 格式';
    const icon = this.getAttribute('icon') || `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 16V4M12 4L7 9M12 4L17 9M5 20H19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    this.shadowRoot.getElementById('drop-text').textContent = text;
    this.shadowRoot.getElementById('drop-hint').textContent = hint;
    this.shadowRoot.getElementById('tool-icon').innerHTML = icon;
  }
  
  setupEventListeners() {
    const fileInput = this.shadowRoot.getElementById('file-input');
    const dropZone = this;
    
    // 点击上传
    this.addEventListener('click', () => {
      fileInput.click();
    });
    
    // 文件选择
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.dispatchEvent(new CustomEvent('fileselect', { 
          detail: e.target.files, 
          bubbles: true 
        }));
      }
    });
    
    // 拖拽上传
    this.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
    
    this.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
    });
    
    this.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      
      if (e.dataTransfer.files.length > 0) {
        this.dispatchEvent(new CustomEvent('fileselect', { 
          detail: e.dataTransfer.files, 
          bubbles: true 
        }));
      }
    });
  }
}

// 注册自定义元素
customElements.define('tool-card', ToolCard);
customElements.define('tool-button', ToolButton);
customElements.define('drop-zone', DropZone);
