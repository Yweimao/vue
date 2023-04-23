// h函数底层调用的还是createVNode方法,创建虚拟节点
import { isObject } from "@vue/shared";
import { createVNode, isVNode } from "./createVNode";

export function h(type, propsOrchildren?, children?) {
  // 参数长度
  const l = arguments.length;
  if (l == 2) {
    // h('div', {style: color: 'red'})
    // h('div', h('span', null, 'hello'))
    // h('div', [h('span', null, 'hello')])
    // h('div', 'hello')
    if (isObject(propsOrchildren) && !Array.isArray(propsOrchildren)) {
      // 命中这种情况 --> h('div', h('span', null, 'hello'))
      if (isVNode(propsOrchildren)) {
        return createVNode(type, null, [propsOrchildren]); // 为什么第三个是数组， 因为createVNode第三个参数只接收:数组、文本、null
      }
      // 命中这种情况 -->  h('div', {style: color: 'red'})
      return createVNode(type, propsOrchildren);
    } else {
      // 命中这种情况 --> h('div', [h('span', null, 'hello')])
      // 或者 h('div', 'hello')
      return createVNode(type, null, propsOrchildren);
    }
  } else {
    // h('div', {style: color: 'red'}, 'hello')
    // h('div', null, 'hello', 'abc', 'edf')
    // h('div', null, h('span', null, 'hello'))
    if (l > 3) {
      // 命中这种情况：  h('div', null, 'hello', 'abc', 'edf')
      children = Array.from(arguments).slice(2);
    }
    if (l == 3 && isVNode(children)) {
      // 命中这种情况： h('div', null, h('span', null, 'hello'))
      children = [children];
    }
    return createVNode(type, propsOrchildren, children);
  }
}
