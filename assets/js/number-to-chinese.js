// ============ 数字转中文大写核心算法 ============
function numberToChinese(num) {
  const str = String(num).trim();
  if (str === '' || isNaN(num)) return '';
  if (parseFloat(str) === 0) return '零元整';
  
  let negative = str.startsWith('-');
  let absStr = negative ? str.substring(1) : str;
  
  let parts = absStr.split('.');
  let intStr = parts[0];
  let decStr = parts[1] || '';
  
  // 边界校验：超过16位整数（千万亿）提示超出范围
  if (intStr.replace(/^0+/, '').length > 16) {
    return '数字超出支持范围';
  }
  
  intStr = intStr.replace(/^0+/, '');
  if (intStr === '') intStr = '0';
  
  const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const cnRadice = ['', '拾', '佰', '仟'];
  const cnUnits = ['', '万', '亿', '万亿'];
  
  function convertInt(s) {
    if (s === '0' || s === '') return '';
    let result = '';
    let zeroCount = 0;
    let len = s.length;
    
    for (let i = 0; i < len; i++) {
      const digit = parseInt(s[i]);
      const posFromRight = len - i - 1;
      const radiceIdx = posFromRight % 4;
      const unitIdx = Math.floor(posFromRight / 4);
      
      if (digit === 0) {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          result += '零';
          zeroCount = 0;
        }
        result += cnNums[digit] + cnRadice[radiceIdx];
      }
      
      if (radiceIdx === 0) {
        let groupStart = i - 3;
        if (groupStart < 0) groupStart = 0;
        let group = s.substring(groupStart, i + 1);
        while (group.length < 4) group = '0' + group;
        
        if (parseInt(group) !== 0) {
          result += cnUnits[unitIdx];
          zeroCount = 0;
        }
      }
    }
    return result;
  }
  
  let intResult = convertInt(intStr);
  let decResult = '';
  
  if (decStr) {
    decStr = decStr.substring(0, 2);
    if (decStr.length >= 1 && parseInt(decStr[0]) !== 0) {
      decResult += cnNums[parseInt(decStr[0])] + '角';
    }
    if (decStr.length >= 2 && parseInt(decStr[1]) !== 0) {
      decResult += cnNums[parseInt(decStr[1])] + '分';
    }
  }
  
  let result = '';
  if (negative) result += '负';
  if (intResult) result += intResult + '元';
  
  if (decResult) {
    if (!intResult) {
      result = (negative ? '负' : '') + decResult;
    } else {
      result += decResult;
    }
  } else if (intResult) {
    result += '整';
  }
  
  return result;
}

// ============ DOM 交互 ============
const input = document.getElementById('num-input');
const output = document.getElementById('num-output');

function convertNumber() {
  let value = input.value;
  const cleaned = value
    .replace(/[^\d.\-]/g, '')
    .replace(/-/g, (m, offset) => offset === 0 ? '-' : '')
    .replace(/\./g, (m, offset, str) => str.indexOf('.') === offset ? '.' : '');
  if (cleaned !== value) {
    input.value = cleaned;
    value = cleaned;
  }
  
  if (value.trim() === '' || value === '-' || value === '.') {
    output.innerHTML = '<span class="text-[--muted] text-base font-sans font-normal">结果将显示在这里</span>';
    return;
  }
  if (isNaN(value)) {
    output.innerHTML = '<span class="text-[--muted] text-base font-sans font-normal">请输入有效数字</span>';
    return;
  }
  
  const result = numberToChinese(value);
  if (result === '数字超出支持范围') {
    output.innerHTML = '<span class="text-[--accent] text-base font-sans font-normal">数字超出支持范围（最大16位整数）</span>';
  } else if (result) {
    output.textContent = result;
  } else {
    output.innerHTML = '<span class="text-[--muted] text-base font-sans font-normal">请输入有效数字</span>';
  }
}

function appendNumber(num) {
  const current = input.value.trim();
  if (current === '' || current === '-' || isNaN(current)) {
    input.value = String(num);
  } else {
    input.value = String(parseFloat(current) + num);
  }
  convertNumber();
}

function clearNumber() {
  input.value = '';
  convertNumber();
  input.focus();
}

// ============ 事件绑定 ============
input.addEventListener('input', convertNumber);

document.querySelectorAll('[data-add]').forEach(btn => {
  btn.addEventListener('click', () => appendNumber(parseInt(btn.dataset.add)));
});

document.getElementById('clear-btn').addEventListener('click', clearNumber);
document.getElementById('clear-all-btn').addEventListener('click', clearNumber);

document.getElementById('copy-input-btn').addEventListener('click', () => {
  const text = input.value;
  if (!text) { showToast('输入为空', true); return; }
  copyToClipboard(text).then(() => showToast('已复制输入')).catch(() => showToast('复制失败', true));
});

document.getElementById('copy-output-btn').addEventListener('click', () => {
  const placeholder = output.querySelector('span');
  if (placeholder) { showToast('结果为空', true); return; }
  const text = output.textContent;
  if (!text) { showToast('结果为空', true); return; }
  copyToClipboard(text).then(() => showToast('已复制大写结果')).catch(() => showToast('复制失败', true));
});

// ============ URL 参数支持 ============
// 支持 tools/number-to-chinese.html?v=12345.67
const urlParams = new URLSearchParams(window.location.search);
const val = urlParams.get('v');
if (val) {
  input.value = val;
  convertNumber();
} else {
  convertNumber();
}
