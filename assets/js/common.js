/* 追加到 common.css 末尾 */

.cat-tab {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--ink-soft);
  background: transparent;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.cat-tab:hover {
  border-color: var(--ink-soft);
  color: var(--ink);
}
.cat-tab.active {
  background: var(--green);
  color: white;
  border-color: var(--green);
}

/* 拖拽排序样式 */
.thumb.dragging {
  opacity: 0.4;
  transform: scale(0.95);
}
.thumb.drag-over {
  border: 2px dashed var(--green);
  transform: translateY(-4px);
}
