export const nodeOps = {
  // 创建元素
  createElement(element) {
    return document.createElement(element);
  },

  // 创建文本节点
  createText(text) {
    return document.createTextNode(text);
  },

  // 插入子节点
  insert(child, container, anchor = null) {
    container.insertBefore(child, anchor || null);
  },

  // 对元素的删除
  remove(child) {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  // 元素查询
  querySelector(selector) {
    return document.querySelectorAll(selector);
  },

  //设置元素内容内容
  setElementText(el, text) {
    el.textContent = text;
  },

  // 设置节点内容
  setText(node, text) {
    node.nodeValue = text;
  },

  nextSibling: (node) => node.nextSibling,
  // 创建注释节点
  createComment: (text) => document.createComment(text),

  parentNode: (node) => node.parentNode,
};
