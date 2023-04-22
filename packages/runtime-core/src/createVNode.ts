import { ShapeFlags, isString } from "@vue/shared";

export function isVNode(value) {
  return !!value.__v_isVNode;
}
export function createVNode(type, props, children = null) {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;
  // 虚拟节点需要有一些重要的属性
  const vnode = {
    __v_isVNode: true, // 判断对象是不是虚拟节点可以采用这个字段
    type,
    props,
    children,
    key: props?.key, // 虚拟节点的key，主要用于diff算法
    el: null, //虚拟节点对应的真实节点
    shapeFlag,
  };
  if (children) {
    let type = 0;
    if (Array.isArray(children)) {
      //自己是元素，儿子是数组
      type = ShapeFlags.ARRAY_CHILDREN;
    } else {
      vnode.children = String(children);
      type = ShapeFlags.TEXT_CHILDREN;
    }
    vnode.shapeFlag |= type;
  }
  // 这里返回了虚拟节点， 并且标识了虚拟节点的类型
  return vnode;
}
