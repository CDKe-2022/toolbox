# ️ 效率工具集 (Efficiency Toolbox)

一个纯粹、简洁、专注的本地化 Web 工具集，旨在解决日常办公、财务与开发中的常见需求。无需安装，无需后端，**双击即可在浏览器中运行**。

![GitHub stars](https://img.shields.io/badge/Stars-0-yellow)
![License](https://img.shields.io/badge/License-MIT-green)
![Language](https://img.shields.io/badge/Language-HTML%20%2B%20JS-blue)

##  核心特性

- 🔒 **绝对隐私安全**：所有数据处理（包括图片、PDF、文本）均在浏览器本地完成，**0 数据上传**，保护您的敏感信息。
- 🚀 **零依赖部署**：单 HTML 文件架构，无需 Node.js、无需构建工具，下载即可使用。
- 🎨 **优雅 UI 设计**：基于 Tailwind CSS 打造，采用舒适的大地绿/米色系主题，提供流畅的交互动画。
- ⚡ **轻量且高效**：原生 JavaScript 编写，配合轻量级 CDN 库，状态管理优化，操作无卡顿。

##  工具列表

本工具集包含 9 个精心打磨的实用工具：

| # | 工具名称 | 功能描述 |
|---|---|---|
| 01 | **大小写转换** | 一键转换英文大小写，支持全部、句首、词首等 5 种模式，实时统计字符/单词数。 |
| 02 | **二维码生成与解析** | 生成高清二维码（支持添加中心 Logo），或上传图片本地解析二维码内容。 |
| 03 | **PDF拆分与合并** | 轻松拆分 PDF 文件或合并多个 PDF 文档，支持按页数或范围拆分。 |
| 04 | **日期计算器** | 计算日期差值（含工作日/周末统计），或推算合同到期日（自动处理月末溢出）。 |
| 05 | **数字转中文大写** | 输入阿拉伯数字，自动转换为标准的人民币大写金额格式（支持负数与小数）。 |
| 06 | **随机数据生成** | 批量生成 UUID、随机密码、测试金额，或进行幸运抽签/名单抽取。 |
| 07 | **图片压缩** | 智能压缩图片体积，支持 JPEG/WebP/PNG 格式转换与多格式体积预估。 |
| 08 | **图片转 PDF** | 将多张图片合并为单个 PDF，支持拖拽排序、A4/贴合模式，自动处理 HEIC 格式。 |
| 09 | **颜色取色器** | 放大图片像素（放大镜效果），精准提取颜色的 HEX 与 RGB 值，支持截图粘贴。 |

## 🚀 快速开始

1. 下载本项目的 `index.html`（或对应的单文件 HTML）。
2. 直接双击该文件，使用任意现代浏览器（Chrome, Edge, Safari, Firefox）打开。
3. 选择你需要的工具，开始使用！

> ** 提示**：由于使用了 `crypto.randomUUID` 和 `Clipboard API`，部分功能在 `file://` 协议下可能受限。如需最佳体验，建议通过本地服务器运行（如 VS Code 的 Live Server 插件）。

## 🛠️ 技术栈

- **核心**：HTML5, CSS3 (CSS Variables), JavaScript (ES6+)
- **样式**：[Tailwind CSS](https://tailwindcss.com/) (CDN)
- **字体**：Noto Sans SC, Noto Serif SC, Fraunces
- **第三方库**：
  - [jsPDF](https://github.com/parallax/jsPDF)：PDF 生成
  - [pdf-lib](https://github.com/Hopding/pdf-lib)：PDF 拆分与合并
  - [SortableJS](https://github.com/SortableJS/Sortable)：图片拖拽排序
  - [heic2any](https://github.com/alexcorvi/heic2any)：HEIC 图片格式转换
  - [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)：二维码生成
  - [jsQR](https://github.com/cozmo/jsQR)：二维码本地解析

## 📄 许可证

本项目代码仅供学习与个人/内部办公使用。

---
*Made with ❤️ for efficiency.*
