// assets/js/components.js
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
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // 整个卡片可点击
    this.addEventListener('click', (e) => {
      // 如果点击的是按钮，让按钮自己处理
      if (e.target.closest('tool-button')) return;
      
      const href = this.getAttribute('href');
      if (href) {
        window.location.href = href;
      }
    });
    
    // 按钮点击处理
    const button = this.shadowRoot.getElementById('card-button');
    if (button) {
      button.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        const href = this.getAttribute('href');
        if (href) {
          window.location.href = href;
        }
      });
    }
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
    
    // 确保按钮有正确的 href
    const button = this.shadowRoot.getElementById('card-button');
    if (button && href) {
      button.setAttribute('data-href', href);
    }
  }
}

customElements.define('tool-card', ToolCard);
