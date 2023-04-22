// packages/runtime-dom/src/nodeOps.ts
var nodeOps = {
  createElement(element) {
    return document.createElement(element);
  },
  createText(text) {
    return document.createTextNode(text);
  },
  insert(child, container, anchor = null) {
    container.insertBefore(child, anchor || null);
  },
  remove(child) {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  querySelector(selector) {
    return document.querySelectorAll(selector);
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  setText(node, text) {
    node.nodeValue = text;
  },
  nextSibling: (node) => node.nextSibling,
  createComment: (text) => document.createComment(text),
  parentNode: (node) => node.parentNode
};
export {
  nodeOps
};
//# sourceMappingURL=runtime-dom.js.map
