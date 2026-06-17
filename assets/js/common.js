// ==========================================
// Toast 状态管理 (第五处 & 第一处优化)
// ==========================================
const ToastManager = {
  timer: null,
  element: null,
  messageEl: null,

  ensureToast() {
    if (this.element) return;
    
    this.element = document.createElement('div');
    this.element.id = 'toast';
    this.element.className = 'toast';
    this.element.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 8L7 11L12 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span id="toast-msg">已复制</span>
    `;
    
    document.body.appendChild(this.element);
    // 缓存 msgEl，避免每次 showToast 都 querySelector
    this.messageEl = this.element.querySelector('#toast-msg');
  },

  show(msg, isError = false) {
    this.ensureToast();
    this.messageEl.textContent = msg;
    this.element.classList.toggle('error', isError);
    this.element.classList.add('show');
    
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.element.classList.remove('show'), 2200);
  }
};

// 对外暴露的全局方法，保持调用兼容性
function showToast(msg, isError = false) {
  ToastManager.show(msg, isError);
}

// ==========================================
// 剪贴板复制 (第二处优化：修复错误处理)
// ==========================================
function copyToClipboard(text) {
  // 优先使用现代 API
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  
  // 降级方案
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      // execCommand 返回布尔值表示成功与否
      const success = document.execCommand('copy');
      if (success) {
        resolve();
      } else {
        reject(new Error('Copy command was unsuccessful'));
      }
    } catch (e) {
      reject(e);
    } finally {
      document.body.removeChild(textarea);
    }
  });
}

// ==========================================
// 返回首页逻辑 (第三处优化：修复空 referrer 判断)
// ==========================================
function goHome() {
  // 确保 referrer 存在且是站内链接
  const isInternalReferrer = document.referrer && document.referrer.startsWith(location.origin);
  
  if (window.history.length > 1 && isInternalReferrer) {
    window.history.back();
  } else {
    window.location.href = '../index.html';
  }
}

// ==========================================
// 全局拖放拦截 (第四处优化：避免误伤 DropZone)
// ==========================================
function preventGlobalDrop(e) {
  // 如果事件发生在允许拖放的组件内，则不拦截
  if (e.target.closest('drop-zone')) {
    return;
  }
  e.preventDefault();
}

window.addEventListener('dragover', preventGlobalDrop);
window.addEventListener('drop', preventGlobalDrop);
