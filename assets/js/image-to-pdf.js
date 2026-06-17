let imageFiles = [];
let currentOrientation = 'auto';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

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
  const list = document.getElementById('image-list');
  const count = document.getElementById('image-count');
  
  if (imageFiles.length === 0) {
    section.classList.add('hidden');
    return;
  }
  
  section.classList.remove('hidden');
  count.textContent = `(${imageFiles.length} 张)`;
  
  list.innerHTML = imageFiles.map((img, idx) => {
    const orient = img.width > img.height ? '横' : '竖';
    return `
      <div class="thumb">
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
  list.querySelectorAll('.thumb-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx);
      imageFiles.splice(idx, 1);
      renderImageList();
    });
  });
}

function clearImages() {
  imageFiles = [];
  renderImageList();
  fileInput.value = '';
}

function selectOrientation(orient) {
  document.querySelectorAll('.orient-option').forEach(o => o.classList.remove('active'));
  document.querySelector(`[data-orient="${orient}"]`).classList.add('active');
  currentOrientation = orient;
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
      let pageOrientation = currentOrientation;
      
      if (currentOrientation === 'auto') {
        pageOrientation = img.width > img.height ? 'landscape' : 'portrait';
      }
      
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
      
      const isPng = img.dataUrl.startsWith('data:image/png');
      const format = isPng ? 'PNG' : 'JPEG';
      
      try {
        pdf.addImage(img.dataUrl, format, x, y, renderWidth, renderHeight, undefined, 'FAST');
      } catch (e) {
        pdf.addImage(img.dataUrl, 'JPEG', x, y, renderWidth, renderHeight, undefined, 'FAST');
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

document.querySelectorAll('.orient-option').forEach(opt => {
  opt.addEventListener('click', () => selectOrientation(opt.dataset.orient));
});
