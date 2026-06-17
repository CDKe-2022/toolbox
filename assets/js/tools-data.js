const TOOLS_DATA = [
  { id: 'number-to-chinese', name: '数字转中文大写', category: 'finance', desc: '将阿拉伯数字转换为人民币大写金额格式，支持小数与负数，一键复制结果。', icon: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><text x="14" y="21" text-anchor="middle" font-size="20" font-weight="700" font-family="Fraunces, serif" fill="currentColor">壹</text></svg>`, status: 'active' },
  { id: 'image-to-pdf', name: '图片转 PDF', category: 'document', desc: '支持 JPEG、PNG、HEIC 等，多张可合并，支持拖拽排序与压缩等级，无白边贴合模式。', icon: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="6" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><circle cx="10" cy="12" r="1.5" fill="currentColor"/><path d="M5 20L11 14L15 18L19 13L23 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`, status: 'active' },
  { id: 'pdf-split', name: 'PDF 拆分/合并', category: 'document', desc: '将 PDF 按页码拆分，或合并多个 PDF 文件为一个。', icon: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4V20M14 4L9 9M14 4L19 9M4 22H24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`, status: 'coming' },
  { id: 'json-formatter', name: 'JSON 格式化', category: 'dev', desc: 'JSON 数据的美化、压缩、校验与树状预览，支持层级折叠。', icon: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M10 8C7 8 6 10 6 14C6 18 7 20 10 20M18 8C21 8 22 10 22 14C22 18 21 20 18 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`, status: 'coming' }
];
const CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'finance', name: '财务工具' },
  { id: 'document', name: '文档处理' },
  { id: 'dev', name: '开发工具' }
];

// PDF拆分与合并工具
const pdfTool = {
  id: 'pdf-split-merge',
  name: 'PDF拆分与合并',
  description: '轻松拆分PDF文件或合并多个PDF文档',
  icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>`,
  href: 'tools/pdf-split-merge.html'
};

// 将工具添加到工具列表
tools.push(pdfTool);

