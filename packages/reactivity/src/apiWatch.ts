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

export function watchEffect(source, options) {
  dowatch(source, null, options);
}

export function watch(source, cb, options) {
  dowatch(source, cb, options);
}

// 响应式对象变化，用户执行回调函数的逻辑
export function dowatch(source, cb, options) {
  // 1 source 是一个响应式对象 如： state
  // 2 source 是一个函数 如： （） => state.name
  let getter;
  // effect + scheduler
  if (isReactive(source)) {
    getter = () => traverse(source);
  } else if (isFunction(source)) {
    getter = source;
  }
  let oldVal;
  let clear;
  function onCleanup(fn) {
    clear = fn;
  }

  function job() {
    if (cb) {
      if (clear) clear(); // 下次执行的时候将上次的执行一下
      // 执行getter函数
      let newVal = effect.run();
      cb(newVal, oldVal, onCleanup);
      oldVal = newVal;
    } else {
      effect.run();
    }
  }
  // getter函数为（） => state.name 就会触发依赖收集
  // 如果数据变化就会触发 scheduler方法执行
  const effect = new ReactiveEffect(getter, job);
  oldVal = effect.run(); // 触发依赖收集
}
