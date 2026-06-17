// ==========================================
// 核心算法：纯字符串处理，杜绝精度丢失
// ==========================================
function numberToChinese(numStr) {
  if (!numStr || !/^-?\d+(\.\d+)?$/.test(numStr)) return '';
  
  // 处理 0 和 0.0 等情况
  if (/^-?0+(\.0+)?$/.test(numStr)) return '零元整';

  let negative = numStr.startsWith('-');
  if (negative) numStr = numStr.substring(1);

  let parts = numStr.split('.');
  let intStr = parts[0];
  let decStr = parts[1] || '';

  // 去除前导零
  intStr = intStr.replace(/^0+/, '');
  if (intStr === '') intStr = '0';

  const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const cnRadice = ['', '拾', '佰', '仟'];
  // 扩展单位表以支持更大数字，并动态计算限制
  const cnUnits = ['', '万', '亿', '万亿', '兆'];
  
  if (intStr.length > cnUnits.length * 4) {
    return '数字超出支持范围';
  }

  // 转换整数部分
  let intResult = '';
  if (intStr !== '0') {
    let zeroCount = 0;
    let len = intStr.length;
    for (let i = 0; i < len; i++) {
      // 🔧 优化：使用 Number 替代 parseInt
      const digit = Number(intStr[i]);
      const posFromRight = len - i - 1;
      const radiceIdx = posFromRight % 4;
      const unitIdx = Math.floor(posFromRight / 4);

      if (digit === 0) {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          intResult += '零';
          zeroCount = 0;
        }
        intResult += cnNums[digit] + cnRadice[radiceIdx];
      }

      // 每组结束时处理单位
      if (radiceIdx === 0) {
        // 检查当前 4 位是否有非零值
        let groupHasValue = false;
        for (let j = Math.max(0, i - 3); j <= i; j++) {
          if (intStr[j] !== '0') {
            groupHasValue = true;
            break;
          }
        }
        if (groupHasValue) {
          intResult += cnUnits[unitIdx];
        }
        // 跨过单位边界后重置零计数，避免跨组零累积
        zeroCount = 0;
      }
    }
  }

  // 转换小数部分
  let decResult = '';
  if (decStr) {
    decStr = (decStr + '00').substring(0, 2); // 补全两位，截断多余
    if (Number(decStr[0]) !== 0) decResult += cnNums[Number(decStr[0])] + '角';
    if (Number(decStr[1]) !== 0) decResult += cnNums[Number(decStr[1])] + '分';
  }

  // 组合结果
  let result = '';
  if (negative) result += '负';
  
  // 🔧 修复 Bug：0.05 缺少 "元" 的问题
  if (intResult) {
    result += intResult + '元';
  } else {
    result += '零元';
  }

  if (decResult) {
    result += decResult;
  } else {
    result += '整';
  }

  return result;
}

// ==========================================
// UI 逻辑拆分：清洗、校验、渲染
// ==========================================
const input = document.getElementById('num-input');
const output = document.getElementById('num-output');

function sanitizeInput(value) {
  // 清除非数字、非小数点、非负号字符
  let cleaned = value.replace(/[^\d.\-]/g, '');
  // 处理负号：仅保留首位
  if (cleaned.startsWith('-')) {
    cleaned = '-' + cleaned.substring(1).replace(/-/g, '');
  } else {
    cleaned = cleaned.replace(/-/g, '');
  }
  // 处理小数点：仅保留首个
  const firstDot = cleaned.indexOf('.');
  if (firstDot !== -1) {
    cleaned = cleaned.substring(0, firstDot + 1) + cleaned.substring(firstDot + 1).replace(/\./g, '');
  }
  return cleaned;
}

function renderOutput(state, text) {
  // 🔧 优化：使用 dataset.state 管理状态，不依赖 DOM 结构判断
  output.dataset.state = state;
  if (state === 'result') {
    output.textContent = text;
    output.className = '';
  } else if (state === 'error') {
    output.innerHTML = `<span class="text-[--accent] text-base font-sans font-normal">${text}</span>`;
  } else {
    output.innerHTML = `<span class="text-[--muted] text-base font-sans font-normal">${text}</span>`;
  }
}

function convertNumber() {
  const rawValue = input.value;
  const cleaned = sanitizeInput(rawValue);
  
  if (cleaned !== rawValue) {
    input.value = cleaned;
  }
  
  const value = cleaned;

  if (value.trim() === '' || value === '-' || value === '.') {
    renderOutput('placeholder', '结果将显示在这里');
    return;
  }

  // 纯正则校验数字格式
  if (!/^-?\d+(\.\d+)?$/.test(value)) {
    renderOutput('placeholder', '请输入有效数字');
    return;
  }

  const result = numberToChinese(value);
  if (result === '数字超出支持范围') {
    renderOutput('error', '数字超出支持范围');
  } else if (result) {
    renderOutput('result', result);
  } else {
    renderOutput('placeholder', '请输入有效数字');
  }
}

// ==========================================
// 交互事件与辅助函数
// ==========================================
function appendNumber(num) {
  const current = input.value.trim();
  if (current === '' || current === '-' || !/^-?\d+$/.test(current)) {
    input.value = String(num);
  } else {
    try {
      // 🔧 优化：使用 BigInt 避免大数累加精度丢失
      const result = BigInt(current) + BigInt(num);
      input.value = result.toString();
    } catch (e) {
      // 如果包含小数，退回普通计算
      input.value = String(Number(current) + num);
    }
  }
  convertNumber();
}

function clearNumber() {
  input.value = '';
  convertNumber();
  input.focus();
}

// 初始化事件绑定
input.addEventListener('input', convertNumber);
document.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', () => appendNumber(Number(btn.dataset.add))));
document.getElementById('clear-btn').addEventListener('click', clearNumber);
document.getElementById('clear-all-btn').addEventListener('click', clearNumber);

document.getElementById('copy-input-btn').addEventListener('click', () => {
  const text = input.value;
  if (!text) { showToast('输入为空', true); return; }
  copyToClipboard(text).then(() => showToast('已复制输入')).catch(() => showToast('复制失败', true));
});

document.getElementById('copy-output-btn').addEventListener('click', () => {
  // 🔧 优化：依据 dataset.state 判断是否有结果
  if (output.dataset.state !== 'result') {
    showToast('结果为空', true);
    return;
  }
  const text = output.textContent;
  if (!text) { showToast('结果为空', true); return; }
  copyToClipboard(text).then(() => showToast('已复制大写结果')).catch(() => showToast('复制失败', true));
});

// URL 参数初始化
const urlParams = new URLSearchParams(window.location.search);
const val = urlParams.get('v');
if (val) {
  input.value = sanitizeInput(val);
  convertNumber();
} else {
  convertNumber();
}
