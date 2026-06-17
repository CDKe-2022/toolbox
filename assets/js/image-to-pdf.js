let imageFiles = [];
let currentMode = 'fit';
let currentQuality = 0.8;

const dropZone = document.getElementById('drop-zone');
const imageList = document.getElementById('image-list');

dropZone.addEventListener('files-selected', (e) => handleFiles(e.detail));

function isHeic(file) {
  const name = file.name.toLowerCase();
  return file.type === 'image/heic' || file.type === 'image/heif' || name.endsWith('.heic') || name.endsWith('.heif');
}

function handleFiles(files) {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.heic', '.heif'];
  const newFiles = Array.from(files).filter(f => {
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    return f.type.startsWith('image/') || validExtensions.includes(ext);
  });
  if (newFiles.length === 0) { showToast('请选择有效的图片文件', true); return; }
  newFiles.forEach(file => {
    if (isHeic(file)) {
      heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => addImage(e.target.result, file.name);
          reader.readAsDataURL(blob);
        }).catch(() => showToast('HEIC 转换失败：' + file.name, true));
    } else {
      const reader = new FileReader();
      reader.onload = e => addImage(e.target.result, file.name);
      reader.readAsDataURL(file);
    }
  });
}

function addImage(dataUrl, name) {
  const img = new Image();
  img.onload = () => {
    imageFiles.push({ dataUrl, width: img.width, height: img.height, name });
    renderImageList();
  };
  img.src = dataUrl;
}

function renderImageList() {
  const section = document.getElementById('image-list-section');
  const count = document.getElementById('image-count');
  if (imageFiles.length === 0) { section.classList.add('hidden'); return; }
  section.classList.remove('hidden');
  count.textContent = `(${imageFiles.length} 张)`;
  imageList.innerHTML = imageFiles.map((img, idx) => {
    const orient = img.width > img.height ? '横' : '竖';
    return `
      <div class="thumb" data-idx="${idx}">
        <img src="${img.dataUrl}" alt="${img.name}">
        <span class="thumb-num">${idx + 1}</span>
        <span class="thumb-orientation">${orient}</span>
        <button class="thumb-remove" data-idx="${idx}" title="移除">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2L8 8M8 2L2 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        </button>
      </div>
    `;
  }).join('');
  imageList.querySelectorAll('.thumb-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      imageFiles.splice(parseInt(btn.dataset.idx), 1);
      renderImageList();
    });
  });
  Sortable.create(imageList, {
    animation: 150, ghostClass: 'dragging', dragClass: 'drag-over',
    onEnd: function (evt) {
      const movedItem = imageFiles.splice(evt.oldIndex, 1)[0];
      imageFiles.splice(evt.newIndex, 0, movedItem);
      renderImageList();
    }
  });
}

function clearImages() { imageFiles = []; renderImageList(); }
function selectMode(mode) {
  document.querySelectorAll('[data-mode]').forEach(o => o.classList.remove('active'));
  document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
  currentMode = mode;
}
function selectQuality(q) {
  document.querySelectorAll('[data-quality]').forEach(o => o.classList.remove('active'));
  document.querySelector(`[data-quality="${q}"]`).classList.add('active');
  currentQuality = parseFloat(q);
}

function compressImage(dataUrl, quality, callback) {
  if (quality >= 1.0) { callback(dataUrl); return; }
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    callback(canvas.toDataURL('image/jpeg', quality));
  };
  img.src = dataUrl;
}

async function convertToPdf() {
  if (imageFiles.length === 0) { showToast('请先选择图片', true); return; }
  const btn = document.getElementById('convert-btn');
  const originalText = btn.innerHTML;
  btn.setAttribute('disabled', '');
  btn.innerHTML = '<div class="spinner"></div> 正在生成 PDF...';
  try {
    const { jsPDF } = window.jspdf;
    let pdf = null;
    for (let i = 0; i < imageFiles.length; i++) {
      const img = imageFiles[i];
      const compressedDataUrl = await new Promise(resolve => compressImage(img.dataUrl, currentQuality, resolve));
      if (currentMode === 'fit') {
        const w = img.width, h = img.height;
        const orientation = w >= h ? 'landscape' : 'portrait';
        if (!pdf) pdf = new jsPDF({ unit: 'pt', format: [w, h], orientation });
        else pdf.addPage([w, h], orientation);
        pdf.addImage(compressedDataUrl, 'JPEG', 0, 0, w, h, undefined, 'FAST');
      } else {
        let pageOrientation = img.width > img.height ? 'landscape' : 'portrait';
        if (!pdf) pdf = new jsPDF({ orientation: pageOrientation, unit: 'mm', format: 'a4' });
        else pdf.addPage('a4', pageOrientation);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const ratio = Math.min((pageWidth - margin * 2) / img.width, (pageHeight - margin * 2) / img.height);
        const renderWidth = img.width * ratio;
        const renderHeight = img.height * ratio;
        const x = (pageWidth - renderWidth) / 2;
        const y = (pageHeight - renderHeight) / 2;
        pdf.addImage(compressedDataUrl, 'JPEG', x, y, renderWidth, renderHeight, undefined, 'FAST');
      }
    }
    pdf.save(`images_${new Date().toISOString().slice(0, 10)}.pdf`);
    showToast('PDF 已生成并下载');
  } catch (err) {
    showToast('生成失败：' + err.message, true);
  } finally {
    btn.removeAttribute('disabled');
    btn.innerHTML = originalText;
  }
}

document.getElementById('clear-images-btn').addEventListener('click', clearImages);
document.getElementById('convert-btn').addEventListener('click', convertToPdf);
document.querySelectorAll('[data-mode]').forEach(opt => opt.addEventListener('click', () => selectMode(opt.dataset.mode)));
document.querySelectorAll('[data-quality]').forEach(opt => opt.addEventListener('click', () => selectQuality(opt.dataset.quality)));
