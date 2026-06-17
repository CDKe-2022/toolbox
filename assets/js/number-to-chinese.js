class NumberToChinese {
  constructor() {
    this.init();
  }
  
  init() {
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    const input = document.getElementById('num-input');
    const output = document.getElementById('num-output');
    
    if (input) {
      // 输入框实时转换
      input.addEventListener('input', () => {
        const value = input.value.trim();
        if (value) {
          const chinese = this.numberToChinese(value);
          output.textContent = chinese;
        } else {
          output.textContent = '结果将显示在这里';
        }
      });
      
      input.addEventListener('keydown', (e) => {
        // Enter键复制结果
        if (e.key === 'Enter') {
          e.preventDefault();
          const copyBtn = document.getElementById('copy-input-btn');
          if (copyBtn) copyBtn.click();
        }
        
        // Esc键清空输入
        if (e.key === 'Escape') {
          e.preventDefault();
          const clearBtn = document.getElementById('clear-all-btn');
          if (clearBtn) clearBtn.click();
        }
      });
      
      // 自动聚焦到输入框
      input.focus();
    }
    
    // 复制输入按钮
    document.getElementById('copy-input-btn')?.addEventListener('click', () => {
      const input = document.getElementById('num-input');
      if (input && input.value) {
        navigator.clipboard.writeText(input.value).then(() => {
          showToast('已复制输入内容');
        });
      }
    });
    
    // 清空全部按钮
    document.getElementById('clear-all-btn')?.addEventListener('click', () => {
      const input = document.getElementById('num-input');
      const output = document.getElementById('num-output');
      if (input) input.value = '';
      if (output) output.textContent = '结果将显示在这里';
      showToast('已清空所有内容');
    });
  }
  
  // 数字转中文大写
  numberToChinese(numStr) {
    const chineseNumbers = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    const units = ['', '拾', '佰', '仟'];
    const bigUnits = ['', '万', '亿'];
    
    // 处理负数
    let isNegative = false;
    if (numStr.startsWith('-')) {
      isNegative = true;
      numStr = numStr.substring(1);
    }
    
    // 分割整数和小数部分
    const parts = numStr.split('.');
    let integerPart = parts[0];
    let decimalPart = parts[1] || '';
    
    // 处理整数部分
    let result = '';
    if (integerPart === '0') {
      result = '零';
    } else {
      let i = 0;
      while (i < integerPart.length) {
        const digit = parseInt(integerPart[i]);
        const unitIndex = integerPart.length - i - 1;
        const bigUnitIndex = Math.floor(unitIndex / 4);
        const unit = units[unitIndex % 4];
        
        if (digit !== 0) {
          result += chineseNumbers[digit] + unit;
        } else {
          // 处理零的情况
          if (result[result.length - 1] !== '零') {
            result += '零';
          }
        }
        
        // 添加大单位
        if (unitIndex % 4 === 0 && i < integerPart.length - 1) {
          result += bigUnits[bigUnitIndex];
        }
        
        i++;
      }
    }
    
    // 处理小数部分
    if (decimalPart) {
      result += '点';
      for (let i = 0; i < decimalPart.length; i++) {
        const digit = parseInt(decimalPart[i]);
        result += chineseNumbers[digit];
      }
    }
    
    // 添加货币单位
    result += '元';
    
    // 处理角分
    if (decimalPart) {
      const jiao = parseInt(decimalPart[0]);
      const fen = decimalPart[1] ? parseInt(decimalPart[1]) : 0;
      
      if (jiao > 0) {
        result += chineseNumbers[jiao] + '角';
      }
      
      if (fen > 0) {
        result += chineseNumbers[fen] + '分';
      }
    } else {
      result += '整';
    }
    
    // 添加负号
    if (isNegative) {
      result = '负' + result;
    }
    
    return result;
  }
}

// 初始化工具
const numberToChineseTool = new NumberToChinese();
