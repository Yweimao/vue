// packages/shared/src/index.ts
var isObject = (val) => {
  return val !== null && typeof val === "object";
};

// packages/reactivity/src/handler.ts
var mutableHandlers = {
  get(target, key, receiver) {
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver);
  }
};

// packages/reactivity/src/reactive.ts
var reaceiveMap = /* @__PURE__ */ new WeakMap();
function reactive(target) {
  if (!isObject(target))
    return target;
  const exitingProxy = reaceiveMap.get(target);
  if (exitingProxy)
    return exitingProxy;
  const proxy = new Proxy(target, mutableHandlers);
  reaceiveMap.set(target, proxy);
  return proxy;
}

// packages/reactivity/src/effect.ts
function effect() {
}
export {
  effect,
  reactive
};
//# sourceMappingURL=reactivity.js.map
