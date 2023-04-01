import { isFunction, isObject } from "@vue/shared";
import { isReactive } from "./reactive";
import { ReactiveEffect } from "./effect";

/**
 *
 * @param val
 * @param seen 防止递归死循环
 * @returns
 */
function traverse(val, seen = new Set()) {
  if (!isObject(val)) return val;
  if (seen.has(val)) return val;
  seen.add(val);
  for (let key in val) {
    traverse(val[key], seen); // 触发属性getter，进行依赖收集
  }
  return val;
}

// 响应式对象变化，用户执行回调函数的逻辑
export function watch(source, cb) {
  let getter;
  if (isReactive(source)) {
    getter = () => traverse(source);
  } else if (isFunction(source)) {
    getter = source;
  }
  let oldVal;
  // getter函数为（） => state.name 就会触发依赖收集
  // 如说数据变化就会出发 scheduler方法执行
  const effect = new ReactiveEffect(getter, () => {
    // 执行getter函数
    let newVal = effect.run();
    cb(newVal, oldVal);
    oldVal = newVal;
  });
  oldVal = effect.run();
}
