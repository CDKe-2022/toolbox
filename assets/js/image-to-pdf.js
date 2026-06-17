// ==========================================
// 状态与数据结构重构 (引入 ObjectURL 和唯一标识)
// ==========================================
let imageFiles = []; // 结构: { id, file, objectUrl, width, height, name, size, type }
let currentMode = 'fit';
let currentOrientation = 'auto';
let currentQuality = 0.8;
let sortableInstance = null; // Sortable 单例

const dropZone = document.getElementById('drop-zone');
const imageList = document.getElementById('image-list');

dropZone.addEventListener('files-selected', (e) => handleFiles(e.detail));

// 事件代理：处理删除按钮点击 (优化频繁重绘时的性能开销)
imageList.addEventListener('click', (e) => {
  const removeBtn = e.target.closest('.thumb-remove');
  if (!removeBtn) return;
  
  const id = removeBtn.dataset.id;
  const index = imageFiles.findIndex(f => f.id === id);
  if (index > -1) {
    // 释放 ObjectURL 内存！
    URL.revokeObjectURL(imageFiles[index].objectUrl);
    imageFiles.splice(index, 1);
    renderImageList();
  }
});

function isHeic(file) {
  const name = file.name.toLowerCase();
  return file.type === 'image/heic' || file.type === 'image/heif' || name.endsWith('.heic') || name.endsWith('.heif');
}

// ==========================================
// 批量导入与统一渲染 (优化串行处理和内存占用)
// ==========================================
async function handleFiles(files) {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.heic', '.heif'];
  const newFiles = Array.from(files).filter(f => {
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    return f.type.startsWith('image/') || validExtensions.includes(ext);
  });
  
  if (newFiles.length === 0) { showToast('请选择有效的图片文件', true); return; }

  // 统一处理文件读取和 HEIC 转换
  const processPromises = newFiles.map(file => {
    return new Promise(async (resolve) => {
      try {
        let targetFile = file;
        if (isHeic(file)) {
          const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
          targetFile = new File([blob], file.name.replace(/\.heic$|\.heif$/i, '.jpg'), { type: 'image/jpeg' });
        }

        const objectUrl = URL.createObjectURL(targetFile);
        const img = new Image();
        img.onload = () => {
          resolve({
            id: crypto.randomUUID(),
            file: targetFile,
            objectUrl,
            width: img.width,
            height: img.height,
            name: targetFile.name,
            size: targetFile.size,
            type: targetFile.type
          });
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(null); // 容错
        };
        img.src = objectUrl;
      } catch (err) {
        showToast('HEIC 转换失败：' + file.name, true);
        resolve(null);
      }
    });
  });

  // 等待所有图片处理完毕，统一推入数组并渲染一次
  const results = await Promise.all(processPromises);
  imageFiles.push(...results.filter(Boolean));
  renderImageList();
}

// ==========================================
// 列表渲染与 Sortable 单例化
// ==========================================
function renderImageList() {
  const section = document.getElementById('image-list-section');
  const count = document.getElementById('image-count');
  if (imageFiles.length === 0) { 
    section.classList.add('hidden'); 
    return; 
  }
  
  section.classList.remove('hidden');
  count.textContent = `(${imageFiles.length} 张)`;
  
  // 使用 ObjectURL 渲染，避免 Base64 内存爆炸
  imageList.innerHTML = imageFiles.map((img, idx) => {
    const orient = img.width > img.height ? '横' : '竖';
    return `
      <div class="thumb" data-id="${img.id}">
        <img src="${img.objectUrl}" alt="${img.name}">
        <span class="thumb-num">${idx + 1}</span>
        <span class="thumb-orientation">${orient}</span>
        <button class="thumb-remove" data-id="${img.id}" title="移除">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2L8 8M8 2L2 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        </button>
      </div>
    `;
  }).join('');

  // Sortable 单例化：避免重复创建导致的事件重叠与内存泄漏
  if (!sortableInstance) {
    sortableInstance = Sortable.create(imageList, {
      animation: 150, 
      ghostClass: 'dragging', 
      dragClass: 'drag-over',
      onEnd: function (evt) {
        const movedItem = imageFiles.splice(evt.oldIndex, 1)[0];
        imageFiles.splice(evt.newIndex, 0, movedItem);
        // 数据层已更新，如果只改顺序无需重新 render，Sortable 已处理 DOM
        // 但如果需要同步序号 thumb-num，则需轻量更新
        updateThumbNumbers();
      }
    });
  } else {
    // 如果数据变动，Sortable 会自动感知内部 DOM 的变化，只需更新序号
    updateThumbNumbers();
  }
}

// 轻量更新序号，避免全量 innerHTML 重建
function updateThumbNumbers() {
  imageList.querySelectorAll('.thumb-num').forEach((el, idx) => {
    el.textContent = idx + 1;
  });
}

function clearImages() {
  // 释放所有 ObjectURL
  imageFiles.forEach(img => URL.revokeObjectURL(img.objectUrl));
  imageFiles = [];
  if (sortableInstance) {
    // 清空时不销毁实例，保留在容器上以备后续使用
    imageList.innerHTML = '';
  }
  renderImageList();
}

// ==========================================
// UI 状态切换
// ==========================================
function selectMode(mode) {
  document.querySelectorAll('[data-mode]').forEach(o => o.classList.remove('active'));
  document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
  currentMode = mode;
}

function selectOrient(orient) {
  document.querySelectorAll('[data-orient]').forEach(o => o.classList.remove('active'));
  document.querySelector(`[data-orient="${orient}"]`).classList.add('active');
  currentOrientation = orient;
}

function selectQuality(q) {
  document.querySelectorAll('[data-quality]').forEach(o => o.classList.remove('active'));
  document.querySelector(`[data-quality="${q}"]`).classList.add('active');
  currentQuality = parseFloat(q);
}

// ==========================================
// 压缩与格式处理 (并行化 & 解决 PNG 透明度问题)
// ==========================================
function compressImage(imgObj) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // 如果是 PNG，保持 PNG 格式不填白底，保留透明度
      const isPng = imgObj.type === 'image/png';
      const format = isPng ? 'image/png' : 'image/jpeg';
      
      // 如果质量要求为 1.0 (最高质量)，直接返回原图 ObjectURL，跳过 Canvas 重绘
      if (currentQuality >= 1.0) {
        resolve({ dataUrl: imgObj.objectUrl, format: format.split('/')[1].toUpperCase() });
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = img.width; 
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      // 非 PNG 图片强制白底
      if (!isPng) {
        ctx.fillStyle = '#ffffff'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      
      resolve({ 
        dataUrl: canvas.toDataURL(format, currentQuality), 
        format: format.split('/')[1].toUpperCase()
      });
    };
    img.src = imgObj.objectUrl;
  });
}

// ==========================================
// PDF 生成逻辑
// ==========================================
async function convertToPdf() {
  if (imageFiles.length === 0) { showToast('请先选择图片', true); return; }
  
  const btn = document.getElementById('convert-btn');
  const originalText = btn.innerHTML;
  btn.setAttribute('disabled', '');
  btn.innerHTML = '<div class="spinner"></div> 正在生成 PDF...';
  
  try {
    const { jsPDF } = window.jspdf;
    let pdf = null;

    // 性能优化：并行压缩所有图片，而不是在 for 循环中串行 await
    const compressedResults = await Promise.all(imageFiles.map(img => compressImage(img)));

    for (let i = 0; i < imageFiles.length; i++) {
      const img = imageFiles[i];
      const { dataUrl, format } = compressedResults[i];
      
      if (currentMode === 'fit') {
        // 贴合图片模式
        const w = img.width, h = img.height;
        const orientation = w >= h ? 'landscape' : 'portrait';
        if (!pdf) pdf = new jsPDF({ unit: 'pt', format: [w, h], orientation });
        else pdf.addPage([w, h], orientation);
        pdf.addImage(dataUrl, format, 0, 0, w, h, undefined, 'FAST');
      } else {
        // A4 标准页模式
        let pageOrientation;
        if (currentOrientation === 'auto') {
          pageOrientation = img.width > img.height ? 'landscape' : 'portrait';
        } else {
          pageOrientation = currentOrientation;
        }
        
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
        
        pdf.addImage(dataUrl, format, x, y, renderWidth, renderHeight, undefined, 'FAST');
      }
    }
    
    pdf.save(`images_${new Date().toISOString().slice(0, 10)}.pdf`);
    showToast('PDF 已生成并下载');
  } catch (err) {
    console.error(err);
    showToast('生成失败：' + err.message, true);
  } finally {
    btn.removeAttribute('disabled');
    btn.innerHTML = originalText;
  }
}

// ==========================================
// 事件绑定初始化
// ==========================================
document.getElementById('clear-images-btn').addEventListener('click', clearImages);
document.getElementById('convert-btn').addEventListener('click', convertToPdf);
document.querySelectorAll('[data-mode]').forEach(opt => opt.addEventListener('click', () => selectMode(opt.dataset.mode)));
document.querySelectorAll('[data-orient]').forEach(opt => opt.addEventListener('click', () => selectOrient(opt.dataset.orient)));
document.querySelectorAll('[data-quality]').forEach(opt => opt.addEventListener('click', () => selectQuality(opt.dataset.quality)));
