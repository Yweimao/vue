import { isObject } from "@vue/shared";
import { mutableHandlers } from "./handler";

// weakMap是一种弱引用的map，当对象被回收时，weakMap会自动删除对应的键值对
// weakMap的键只能是对象，值可以是任意类型
const reaceiveMap = new WeakMap();

export function reactive(target) {
  if (!isObject(target)) return target;

  const exitingProxy = reaceiveMap.get(target); //看一下这个对象是否被代理过

  if (exitingProxy) return exitingProxy; //代理过直接返回

  const proxy = new Proxy(target, mutableHandlers); // 没有代理过，就创建一个代理对象

  reaceiveMap.set(target, proxy); // 缓存代理对象

  return proxy;
}
