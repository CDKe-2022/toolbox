class PDFSplitMerge {
  constructor() {
    this.mode = 'split';
    this.files = [];
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupModeToggle();
    this.setMode('split');
  }
  
  setupEventListeners() {
    // 模式切换
    document.querySelectorAll('.mode-option').forEach(option => {
      option.addEventListener('click', () => {
        this.setMode(option.dataset.mode);
      });
    });
    
    // 文件上传
    const splitUpload = document.getElementById('pdf-upload');
    const mergeUpload = document.getElementById('merge-upload');
    
    splitUpload.addEventListener('click', () => {
      const input = splitUpload.querySelector('input[type="file"]');
      input.click();
    });
    
    mergeUpload.addEventListener('click', () => {
      const input = mergeUpload.querySelector('input[type="file"]');
      input.click();
    });
    
    // 文件选择事件
    splitUpload.querySelector('input[type="file"]').addEventListener('change', (e) => {
      if (e.target.files[0]) this.handleFileSelect(e.target.files[0], 'split');
    });
    
    mergeUpload.querySelector('input[type="file"]').addEventListener('change', (e) => {
      if (e.target.files.length > 0) this.handleMultipleFiles(e.target.files, 'merge');
    });
    
    // 拖拽上传
    [splitUpload, mergeUpload].forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
      });
      
      zone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
      });
      
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        
        if (zone.id === 'pdf-upload') {
          if (e.dataTransfer.files[0]) this.handleFileSelect(e.dataTransfer.files[0], 'split');
        } else {
          if (e.dataTransfer.files.length > 0) this.handleMultipleFiles(e.dataTransfer.files, 'merge');
        }
      });
    });
    
    // 操作按钮
    document.getElementById('split-btn')?.addEventListener('click', () => this.splitPDF());
    document.getElementById('merge-btn')?.addEventListener('click', () => this.mergePDF());
    document.getElementById('clear-btn')?.addEventListener('click', () => this.clearAll());
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      // 只在输入框未聚焦时处理
      if (document.activeElement.tagName === 'INPUT') return;

      if (e.key === 'Enter') {
        if (this.mode === 'split' && document.getElementById('split-btn')?.offsetParent) {
          e.preventDefault();
          document.getElementById('split-btn').click();
        } else if (this.mode === 'merge' && document.getElementById('merge-btn')?.offsetParent) {
          e.preventDefault();
          document.getElementById('merge-btn').click();
        }
      }
      
      if (e.key === 'Escape') {
        this.clearAll();
      }
    });
  }
  
  setupModeToggle() {
    document.querySelectorAll('.mode-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.mode-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        this.setMode(option.dataset.mode);
      });
    });
  }
  
  setMode(mode) {
    this.mode = mode;
    if (mode === 'split') {
      document.getElementById('split-mode').classList.remove('hidden');
      document.getElementById('merge-mode').classList.add('hidden');
      document.getElementById('split-btn')?.classList.remove('hidden');
      document.getElementById('merge-btn')?.classList.add('hidden');
    } else {
      document.getElementById('split-mode').classList.add('hidden');
      document.getElementById('merge-mode').classList.remove('hidden');
      document.getElementById('split-btn')?.classList.add('hidden');
      document.getElementById('merge-btn')?.classList.remove('hidden');
    }
  }
  
  handleFileSelect(file, mode) {
    if (!file || file.type !== 'application/pdf') {
      showToast('请选择有效的PDF文件', 'error');
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) {
      showToast('文件大小不能超过 50MB', 'error');
      return;
    }
    
    if (mode === 'split') {
      this.files = [file];
      this.showPDFPreview(file);
      document.getElementById('split-options').classList.remove('hidden');
      document.getElementById('split-btn').classList.remove('hidden');
    }
  }
  
  handleMultipleFiles(files, mode) {
    const validFiles = Array.from(files).filter(file => {
      return file.type === 'application/pdf' && file.size <= 50 * 1024 * 1024;
    });
    
    if (validFiles.length === 0) {
      showToast('请选择有效的PDF文件', 'error');
      return;
    }
    
    if (mode === 'merge') {
      this.files = [...this.files, ...validFiles];
      this.showMergeList();
      document.getElementById('merge-btn').classList.remove('hidden');
    }
  }
  
  showPDFPreview(file) {
    const preview = document.getElementById('pdf-preview');
    const fileName = preview.querySelector('.font-medium');
    const pageCount = document.getElementById('page-count');
    
    fileName.textContent = file.name;
    pageCount.textContent = '计算中...';
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const pdfData = new Uint8Array(e.target.result);
        const pdfDoc = await PDFLib.PDFDocument.load(pdfData);
        pageCount.textContent = pdfDoc.getPageCount().toString();
      } catch (error) {
        pageCount.textContent = '0';
        showToast('无法读取PDF文件', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
    
    preview.classList.remove('hidden');
  }
  
  showMergeList() {
    const list = document.getElementById('merge-list');
    const fileList = document.getElementById('file-list');
    
    list.classList.remove('hidden');
    fileList.innerHTML = '';
    
    this.files.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
      item.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
          </div>
          <div>
            <div class="font-medium text-[--ink]">${file.name}</div>
            <div class="text-xs text-[--muted]">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
          </div>
        </div>
        <tool-button variant="ghost" size="sm" onclick="pdfTool.removeFile(${index})">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </tool-button>
      `;
      fileList.appendChild(item);
    });
  }
  
  removeFile(index) {
    this.files.splice(index, 1);
    if (this.files.length === 0) {
      document.getElementById('merge-list').classList.add('hidden');
      document.getElementById('merge-btn').classList.add('hidden');
    } else {
      this.showMergeList();
    }
  }
  
  removePdf() {
    this.files = [];
    document.getElementById('pdf-preview').classList.add('hidden');
    document.getElementById('split-options').classList.add('hidden');
    document.getElementById('split-btn').classList.add('hidden');
  }
  
  clearMergeFiles() {
    this.files = [];
    document.getElementById('merge-list').classList.add('hidden');
    document.getElementById('merge-btn').classList.add('hidden');
  }
  
  // 设置按钮 loading 状态
  setLoading(btnId, isLoading, originalText) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    
    if (isLoading) {
      btn.setAttribute('disabled', 'true');
      btn.innerHTML = `<span class="spinner"></span> 处理中...`;
    } else {
      btn.removeAttribute('disabled');
      btn.innerHTML = originalText;
    }
  }
  
  async splitPDF() {
    if (this.files.length === 0) return;
    
    const file = this.files[0];
    const method = document.querySelector('input[name="split-method"]:checked')?.value;
    
    if (!method) {
      showToast('请选择拆分方式', 'error');
      return;
    }
    
    const btn = document.getElementById('split-btn');
    const originalText = btn.innerHTML;
    this.setLoading('split-btn', true, originalText);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      if (method === 'pages') {
        const pagesPerFile = parseInt(document.querySelector('.split-pages').value);
        if (!pagesPerFile || pagesPerFile < 1) {
          showToast('请输入有效的页数', 'error');
          this.setLoading('split-btn', false, originalText);
          return;
        }
        const totalFiles = Math.ceil(pageCount / pagesPerFile);
        
        for (let i = 0; i < totalFiles; i++) {
          const newPdf = await PDFLib.PDFDocument.create();
          const startPage = i * pagesPerFile;
          const endPage = Math.min(startPage + pagesPerFile, pageCount);
          
          for (let j = startPage; j < endPage; j++) {
            const [page] = await newPdf.copyPages(pdfDoc, [j]);
            newPdf.addPage(page);
          }
          
          const bytes = await newPdf.save();
          this.downloadPDF(bytes, `split_${i + 1}.pdf`);
        }
      } else if (method === 'range') {
        const startPage = parseInt(document.querySelector('.split-start').value) - 1;
        const endPage = parseInt(document.querySelector('.split-end').value);
        
        if (startPage >= pageCount || endPage > pageCount || startPage >= endPage || startPage < 0) {
          showToast('页码范围无效', 'error');
          this.setLoading('split-btn', false, originalText);
          return;
        }
        
        const newPdf = await PDFLib.PDFDocument.create();
        for (let j = startPage; j < endPage; j++) {
          const [page] = await newPdf.copyPages(pdfDoc, [j]);
          newPdf.addPage(page);
        }
        
        const bytes = await newPdf.save();
        this.downloadPDF(bytes, `split_range.pdf`);
      }
      
      showToast('拆分完成！');
    } catch (error) {
      console.error('拆分失败:', error);
      showToast('拆分失败，请重试', 'error');
    } finally {
      this.setLoading('split-btn', false, originalText);
    }
  }
  
  async mergePDF() {
    if (this.files.length < 2) {
      showToast('请至少选择2个PDF文件', 'error');
      return;
    }
    
    const btn = document.getElementById('merge-btn');
    const originalText = btn.innerHTML;
    this.setLoading('merge-btn', true, originalText);
    
    try {
      const mergedPdf = await PDFLib.PDFDocument.create();
      
      // 使用 for...of 依次处理文件
      for (const file of this.files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }
      
      const bytes = await mergedPdf.save();
      this.downloadPDF(bytes, `merged.pdf`);
      showToast('合并完成！');
    } catch (error) {
      console.error('合并失败:', error);
      showToast('合并失败，请重试', 'error');
    } finally {
      this.setLoading('merge-btn', false, originalText);
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
  
  clearAll() {
    this.files = [];
    document.getElementById('pdf-preview')?.classList.add('hidden');
    document.getElementById('split-options')?.classList.add('hidden');
    document.getElementById('merge-list')?.classList.add('hidden');
    document.getElementById('split-btn')?.classList.add('hidden');
    document.getElementById('merge-btn')?.classList.add('hidden');
    
    document.querySelectorAll('input[type="file"]').forEach(input => {
      input.value = '';
    });
    
    // 重置单选框
    const defaultRadio = document.querySelector('input[name="split-method"][value="pages"]');
    if (defaultRadio) defaultRadio.checked = true;
    
    showToast('已清空所有内容');
  }
}

// 初始化工具
const pdfTool = new PDFSplitMerge();
