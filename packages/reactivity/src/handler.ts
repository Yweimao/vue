export const mutableHandlers = {
  get(target, key, receiver) {
    // receiver表示代理对象
    // 我们使用proxy要搭配 reflect来使用， 解决this的指向问题
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    // 更新数据
    return Reflect.set(target, key, value, receiver);
  },
};
