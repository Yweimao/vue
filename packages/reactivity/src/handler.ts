import { ReactiveFlags } from "./reactive";

export const mutableHandlers = {
  // 代理对象的get方法，拦截代理对象的读取属性操作。
  get(target, key, receiver) {
    if (key == ReactiveFlags.IS_REACTIVE) return true;
    // receiver表示代理对象
    // 我们使用proxy要搭配 reflect来使用， 解决this的指向问题
    return Reflect.get(target, key, receiver);
  },
  // 代理对象的set方法，拦截代理对象的设置操作。
  set(target, key, value, receiver) {
    // 更新数据
    return Reflect.set(target, key, value, receiver);
  },
};
