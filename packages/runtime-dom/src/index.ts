// 用来耦合所有的 dom api的
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";

import { createRenderer as renderer } from "@vue/runtime-core";

const renderOptions = Object.assign(nodeOps, { patchProp });

// 用户自己创造渲染器，把属性传递进来
export function createRenderer(renderOptions) {
  // 这里提供了渲染api, 调用了底层的方法
  return renderer(renderOptions);
}

// 内置渲染器，会自动传入dom api 专门给vue来服务的
export function render(vnode, container) {
  const renderer = createRenderer(renderOptions);
  return renderer.render(vnode, container);
}

// render方法是基于平台

export * from "@vue/runtime-core";
