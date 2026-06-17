/**
 * 工具集数据文件
 * 包含所有工具的信息及分类筛选逻辑
 */

const tools = [
  {
    id: 'number-to-chinese',
    num: 'Tool 01',
    name: '数字转中文大写',
    desc: '输入阿拉伯数字，自动转换为人民币大写金额格式，支持一键复制。',
    href: 'tools/number-to-chinese.html',
    status: 'active',
    category: '财务',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>`,
    keywords: ['数字', '中文', '金额', '大写', '财务']
  },
  {
    id: 'image-to-pdf',
    num: 'Tool 02',
    name: '图片转 PDF',
    desc: '将多张图片合并为单个 PDF 文件，支持拖拽排序、压缩与方向选择。',
    href: 'tools/image-to-pdf.html',
    status: 'active',
    category: '图片',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21,15 16,10 5,21"/>
    </svg>`,
    keywords: ['图片', 'PDF', '转换', '合并', '压缩']
  },
  {
    id: 'pdf-split-merge',
    num: 'Tool 03',
    name: 'PDF拆分与合并',
    desc: '轻松拆分PDF文件或合并多个PDF文档，所有操作在本地完成，保护隐私。',
    href: 'tools/pdf-split-merge.html',
    status: 'active',
    category: 'PDF',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>`,
    keywords: ['PDF', '拆分', '合并', '分割', '文档']
  }
];

// 自动提取所有分类并去重，前置添加"全部"分类
const categories = ['全部', ...new Set(tools.map(tool => tool.category))];

// 暴露给全局对象，以便 index.html 调用
window.toolData = {
  tools,
  categories
};
