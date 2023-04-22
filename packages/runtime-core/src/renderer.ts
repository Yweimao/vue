export function createRenderer(renderOptions) {
  const {
    createElement: hostCreateElement,
    createText: hostCreateText,
    insert: hostInsert,
    remove: hostRemove,
    querySelector: hostQuerySelector,
    setElementText: hostSetElementText,
    setText: hostSetText,
    nextSibling: hostNextSibling,
    createComment: hostCreateComment,
    parentNode: hostParentNode,
    patchProp: hostPatchProp,
  } = renderOptions; //这些方法和平台无关

  const render = (vnode, container) => {
    // 虚拟节点创建 最终生成真实dom 渲染到容器中
    console.log(renderOptions, vnode, container);
  };

  return { render };
}

// runtime-core中的createRenderer是不基于平台的
