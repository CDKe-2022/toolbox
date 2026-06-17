let toastTimer = null;
let toastEl = null;

function ensureToast() {
  if (toastEl) return toastEl;
  toastEl = document.createElement('div');
  toastEl.id = 'toast';
  toastEl.className = 'toast';
  toastEl.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 8L7 11L12 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span id="toast-msg">已复制</span>
  `;
  document.body.appendChild(toastEl);
  return toastEl;
}

function showToast(msg, isError = false) {
  const toast = ensureToast();
  const msgEl = toast.querySelector('#toast-msg');
  msgEl.textContent = msg;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); resolve(); } catch (e) { reject(e); }
    document.body.removeChild(textarea);
  });
}

function goHome() {
  if (window.history.length > 1 && document.referrer.includes(location.origin)) {
    window.history.back();
  } else {
    window.location.href = '../index.html';
  }
}

window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('drop', (e) => e.preventDefault());
