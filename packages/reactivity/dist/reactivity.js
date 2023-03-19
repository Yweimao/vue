// packages/shared/src/index.ts
var isObject = (val) => {
  return val !== null && typeof val === "object";
};

// packages/reactivity/src/handler.ts
var mutableHandlers = {
  get(target, key, receiver) {
    if (key == "__v_isReactive" /* IS_REACTIVE */)
      return true;
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver);
  }
};

// packages/reactivity/src/reactive.ts
var reaceiveMap = /* @__PURE__ */ new WeakMap();
var ReactiveFlags = /* @__PURE__ */ ((ReactiveFlags2) => {
  ReactiveFlags2["IS_REACTIVE"] = "__v_isReactive";
  return ReactiveFlags2;
})(ReactiveFlags || {});
function reactive(target) {
  if (!isObject(target))
    return target;
  const exitingProxy = reaceiveMap.get(target);
  if (target["__v_isReactive" /* IS_REACTIVE */])
    return target;
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
  ReactiveFlags,
  effect,
  reactive
};
//# sourceMappingURL=reactivity.js.map
