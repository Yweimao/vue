export function patchStyle(el, preVal, nextVal) {
  const style = el.style;
  if (nextVal) {
    for (const key in nextVal) {
      style[key] = nextVal[key]; //用新的样式直接添加即可
    }
  }

  if (preVal) {
    // 如果有老样式
    for (const key in preVal) {
      if (nextVal[key] == null) {
        // 但是新样式中没有老样式的key
        style[key] = null; // 删除老对象中的key
      }
    }
  }
}
