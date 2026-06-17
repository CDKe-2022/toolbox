let imageFiles = [];
let currentMode = 'fit';
let currentQuality = 0.8;

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const imageList = document.getElementById('image-list');

function isHeic(file) {
  const name = file.name.toLowerCase();
  return file.type === 'image/heic' || file.type === 'image/heif' ||
         name.endsWith('.heic') || name.endsWith('.heif');
}

function handleFiles(files) {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.heic', '.heif'];
  const newFiles = Array.from(files).filter(f => {
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    return f.type.startsWith('image/') || validExtensions.includes(ext);
  });
  
  if (newFiles.length === 0) {
    showToast('请选择有效的图片文件', true);
    return;
  }
  
  newFiles.forEach(file => {
    if (isHeic(file)) {
      heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => addImage(e.target.result, file.name);
          reader.onerror = () => showToast('读取失败：' + file.name, true);
          reader.readAsDataURL(blob);
        })
        .catch(err => {
          console.error('HEIC转换失败', err);
          showToast('HEIC 转换失败：' + file.name, true);
        });
    } else {
      const reader = new FileReader();
      reader.onload = e => addImage(e.target.result, file.name);
      reader.onerror = () => showToast('读取失败：' + file.name, true);
      reader.readAsDataURL(file);
    }
  });
}

function addImage(dataUrl, name) {
  const img = new Image();
  img.onload = () => {
    imageFiles.push({
      dataUrl: dataUrl,
      width: img.width,
      height: img.height,
      name: name
    });
    renderImageList();
  };
  img.onerror = () => showToast('图片加载失败：' + name, true);
  img.src = dataUrl;
}

function renderImageList() {
  const section = document.getElementById('image-list-section');
  const count = document.getElementById('image-count');
  
  if (imageFiles.length === 0) {
    section.classList.add('hidden');
    return;
  }
  
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
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    `;
  }).join('');
  
  // 绑定删除按钮
  imageList.querySelectorAll('.thumb-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx);
      imageFiles.splice(idx, 1);
      renderImageList();
    });
  });
  
  // 初始化拖拽排序
  Sortable.create(imageList, {
    animation: 150,
    ghostClass: 'dragging',
    dragClass: 'drag-over',
    onEnd: function (evt) {
      const movedItem = imageFiles.splice(evt.oldIndex, 1)[0];
      imageFiles.splice(evt.newIndex, 0, movedItem);
      renderImageList();
    }
  });
}

function clearImages() {
  imageFiles = [];
  renderImageList();
  fileInput.value = '';
}

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

// 使用 Canvas 压缩图片
function compressImage(dataUrl, quality, callback) {
  if (quality >= 1.0) {
    callback(dataUrl);
    return;
  }
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    // 白色背景，防止透明 PNG 变黑
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    callback(canvas.toDataURL('image/jpeg', quality));
  };
  img.src = dataUrl;
}

async function convertToPdf() {
  if (imageFiles.length === 0) {
    showToast('请先选择图片', true);
    return;
  }
  
  const btn = document.getElementById('convert-btn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> 正在生成 PDF...';
  
  try {
    const { jsPDF } = window.jspdf;
    let pdf = null;
    
    for (let i = 0; i < imageFiles.length; i++) {
      const img = imageFiles[i];
      
      // 压缩图片
      const compressedDataUrl = await new Promise(resolve => {
        compressImage(img.dataUrl, currentQuality, resolve);
      });
      
      if (currentMode === 'fit') {
        const w = img.width;
        const h = img.height;
        const orientation = w >= h ? 'landscape' : 'portrait';
        
        if (!pdf) {
          pdf = new jsPDF({ unit: 'pt', format: [w, h], orientation: orientation });
        } else {
          pdf.addPage([w, h], orientation);
        }
        pdf.addImage(compressedDataUrl, 'JPEG', 0, 0, w, h, undefined, 'FAST');
        
      } else {
        let pageOrientation = img.width > img.height ? 'landscape' : 'portrait';
        
        if (!pdf) {
          pdf = new jsPDF({ orientation: pageOrientation, unit: 'mm', format: 'a4' });
        } else {
          pdf.addPage('a4', pageOrientation);
        }
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const availWidth = pageWidth - margin * 2;
        const availHeight = pageHeight - margin * 2;
        
        const ratio = Math.min(availWidth / img.width, availHeight / img.height);
        const renderWidth = img.width * ratio;
        const renderHeight = img.height * ratio;
        
        const x = (pageWidth - renderWidth) / 2;
        const y = (pageHeight - renderHeight) / 2;
        
        pdf.addImage(compressedDataUrl, 'JPEG', x, y, renderWidth, renderHeight, undefined, 'FAST');
      }
    }
    
    const filename = `images_${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(filename);
    showToast('PDF 已生成并下载');
  } catch (err) {
    console.error(err);
    showToast('生成失败：' + err.message, true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

// ============ 事件绑定 ============
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('dragover');
});
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    handleFiles(e.dataTransfer.files);
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) handleFiles(e.target.files);
});

document.getElementById('clear-images-btn').addEventListener('click', clearImages);
document.getElementById('convert-btn').addEventListener('click', convertToPdf);

document.querySelectorAll('[data-mode]').forEach(opt => {
  opt.addEventListener('click', () => selectMode(opt.dataset.mode));
});

document.querySelectorAll('[data-quality]').forEach(opt => {
  opt.addEventListener('click', () => selectQuality(opt.dataset.quality));
});
