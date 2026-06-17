class ToolButton extends HTMLElement {
  static get observedAttributes() { return ['disabled', 'variant']; }
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;
    this.classList.add('btn');
    this.updateVariant();
    this.addEventListener('click', (e) => {
      if (this.hasAttribute('disabled')) { e.preventDefault(); e.stopPropagation(); }
    });
  }
  updateVariant() {
    const variant = this.getAttribute('variant') || 'primary';
    ['primary', 'ghost', 'accent'].forEach(v => this.classList.remove(`btn-${v}`));
    this.classList.add(`btn-${variant}`);
  }
  attributeChangedCallback(name) {
    if (name === 'variant') this.updateVariant();
    if (name === 'disabled') this.classList.toggle('disabled', this.hasAttribute('disabled'));
  }
}
customElements.define('tool-button', ToolButton);

class InfoCard extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;
    const title = this.getAttribute('title') || '说明';
    this.classList.add('info-card', 'mt-12');
    const content = this.innerHTML;
    this.innerHTML = `
      <h4 class="text-sm font-semibold text-[--green] mb-3 flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.3"/>
          <path d="M7 4V7.5M7 9.5V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        ${title}
      </h4>
      <ul class="text-xs text-[--ink-soft] space-y-1.5 leading-relaxed">${content}</ul>
    `;
  }
}
customElements.define('info-card', InfoCard);

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
    this.addEventListener('click', () => input.click());
    this.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); this.classList.add('dragover'); });
    this.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); this.classList.remove('dragover'); });
    this.addEventListener('drop', (e) => {
      e.preventDefault(); e.stopPropagation(); this.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.dispatchEvent(new CustomEvent('files-selected', { detail: e.dataTransfer.files }));
      }
    });
    input.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.dispatchEvent(new CustomEvent('files-selected', { detail: e.target.files }));
      }
    });
  }
}
customElements.define('drop-zone', DropZone);

class ToolCard extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;
    const status = this.getAttribute('status') || 'active';
    const num = this.getAttribute('num') || '···';
    const name = this.getAttribute('name');
    const desc = this.getAttribute('desc');
    const href = this.getAttribute('href');
    const iconHTML = this.innerHTML;
    if (status === 'coming') {
      this.classList.add('tool-card', 'disabled');
      this.innerHTML = `
        <div class="tool-icon">${iconHTML}</div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-xl font-semibold text-[--ink]">${name}</h3>
          <span class="tool-num">${num}</span>
        </div>
        <p class="text-sm text-[--ink-soft] leading-relaxed mb-6">${desc}</p>
        <div class="flex items-center gap-2 text-xs text-[--muted] font-medium"><span>敬请期待</span></div>
      `;
    } else {
      this.classList.add('tool-card');
      this.innerHTML = `
        <div class="tool-icon">${iconHTML}</div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-xl font-semibold text-[--ink]">${name}</h3>
          <span class="tool-num">${num}</span>
        </div>
        <p class="text-sm text-[--ink-soft] leading-relaxed mb-6">${desc}</p>
        <div class="flex items-center gap-2 text-xs text-[--green] font-medium">
          <span>进入工具</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7H11M11 7L7 3M11 7L7 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      `;
      this.addEventListener('click', () => window.location.href = href);
    }
  }
}
customElements.define('tool-card', ToolCard);
