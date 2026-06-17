class ImageToPDF {
  constructor() {
    this.images = [];
    this.init();
  }
  
  init() {
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    const uploadZone = document.getElementById('image-upload');
    const fileInput = uploadZone.querySelector('input[type="file"]');
    
    // 点击上传
    uploadZone.addEventListener('click', () => {
      fileInput.click();
    });
    
    // 文件选择
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleImageSelect(e.target.files);
      }
    });
    
    // 拖拽上传
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      
      if (e.dataTransfer.files.length > 0) {
        this.handleImageSelect(e.dataTransfer.files);
      }
    });
    
    // 质量滑块
    const qualitySlider = document.getElementById('quality');
    if (qualitySlider) {
      qualitySlider.addEventListener('input', (e) => {
        document.getElementById('quality-value').textContent = `${Math.round(e.target.value * 100)}%`;
      });
    }
    
    // 操作按钮
    document.getElementById('convert-btn')?.addEventListener('click', () => this.convertToPDF());
    document.getElementById('clear-btn')?.addEventListener('click', () => this.clearAll());
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && document.getElementById('convert-btn')?.offsetParent) {
        e.preventDefault();
        document.getElementById('convert-btn').click();
      }
      
      if (e.key === 'Escape') {
        this.clearAll();
      }
    });
  }
  
  handleImageSelect(files) {
    const validImages = Array.from(files).filter(file => {
      return file.type.startsWith('image/') && file.size <= 50 * 1024 * 1024;
    });
    
    if (validImages.length === 0) {
      showToast('请选择有效的图片文件', 'error');
      return;
    }
    
    this.images = [...this.images, ...validImages];
    this.showImagePreview();
    document.getElementById('pdf-settings').classList.remove('hidden');
    document.getElementById('convert-btn').classList.remove('hidden');
  }
  
  showImagePreview() {
    const preview = document.getElementById('image-preview');
    const imageList = document.getElementById('image-list');
    
    preview.classList.remove('hidden');
    imageList.innerHTML = '';
    
    this.images.forEach((image, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'relative group';
        imgContainer.innerHTML = `
          <img src="${e.target.result}" class="w-full h-24 object-cover rounded-lg">
          <div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <tool-button variant="ghost" size="sm" onclick="imageTool.removeImage(${index})">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </tool-button>
          </div>
          <div class="text-xs text-center mt-1 truncate">${image.name}</div>
        `;
        imageList.appendChild(imgContainer);
      };
      reader.readAsDataURL(image);
    });
  }
  
  removeImage(index) {
    this.images.splice(index, 1);
    if (this.images.length === 0) {
      document.getElementById('image-preview').classList.add('hidden');
      document.getElementById('pdf-settings').classList.add('hidden');
      document.getElementById('convert-btn').classList.add('hidden');
    } else {
      this.showImagePreview();
    }
  }
  
  clearImages() {
    this.images = [];
    document.getElementById('image-preview').classList.add('hidden');
    document.getElementById('pdf-settings').classList.add('hidden');
    document.getElementById('convert-btn').classList.add('hidden');
    document.getElementById('image-upload').querySelector('input[type="file"]').value = '';
  }
  
  clearAll() {
    this.clearImages();
    showToast('已清空所有内容');
  }
  
  async convertToPDF() {
    if (this.images.length === 0) return;
    
    const orientation = document.querySelector('input[name="orientation"]:checked')?.value || 'portrait';
    const quality = parseFloat(document.getElementById('quality')?.value || 0.8);
    
    try {
      showToast('正在转换，请稍候...');
      
      const pdfDoc = await PDFLib.PDFDocument.create();
      
      for (const image of this.images) {
        const arrayBuffer = await image.arrayBuffer();
        let img;
        
        if (image.type === 'image/jpeg') {
          img = await pdfDoc.embedJpg(arrayBuffer);
        } else {
          img = await pdfDoc.embedPng(arrayBuffer);
        }
        
        const page = pdfDoc.addPage();
        const dims = img.scale(1);
        
        if (orientation === 'landscape') {
          page.setSize(dims.height, dims.width);
          page.drawImage(img, {
            x: 0,
            y: 0,
            width: dims.height,
            height: dims.width,
          });
        } else {
          page.drawImage(img, {
            x: 0,
            y: 0,
            width: dims.width,
            height: dims.height,
          });
        }
      }
      
      const bytes = await pdfDoc.save();
      this.downloadPDF(bytes, `images-${Date.now()}.pdf`);
      showToast('转换完成！');
    } catch (error) {
      console.error('转换失败:', error);
      showToast('转换失败，请重试', 'error');
    }
  }
  
  downloadPDF(bytes, filename) {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// 初始化工具
const imageTool = new ImageToPDF();
