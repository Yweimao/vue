// packages/shared/src/index.ts
var isObject = (val) => {
  return val !== null && typeof val === "object";
};

// packages/reactivity/src/effect.ts
var activeEffect = void 0;
function cleanupEffect(effect2) {
  const { deps } = effect2;
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect2);
  }
  effect2.deps.length = 0;
}
var ReactiveEffect = class {
  constructor(fn) {
    this.fn = fn;
    this.parent = void 0;
    this.deps = [];
  }
  run() {
    try {
      this.parent = activeEffect;
      activeEffect = this;
      cleanupEffect(this);
      return this.fn();
    } finally {
      activeEffect = this.parent;
      this.parent = void 0;
    }
  }
};
function effect(fn) {
  const _effect = new ReactiveEffect(fn);
  _effect.run();
}
var targetMap = /* @__PURE__ */ new WeakMap();
function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = /* @__PURE__ */ new Set());
    }
    const shouldTrack = !dep.has(activeEffect);
    if (shouldTrack) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);
    }
  }
}
function trigger(target, key, newValue, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap)
    return;
  const dep = depsMap.get(key);
  const effects = [...dep];
  effects && effects.forEach((effect2) => {
    if (effect2 !== activeEffect) {
      effect2.run();
    }
  });
}

// packages/reactivity/src/handler.ts
var mutableHandlers = {
  get(target, key, receiver) {
    if (key == "__v_isReactive" /* IS_REACTIVE */)
      return true;
    const res = Reflect.get(target, key, receiver);
    track(target, key);
    return res;
  },
  set(target, key, value, receiver) {
    const oldValue = target[key];
    const r = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key, value, oldValue);
    }
    return r;
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
export {
  ReactiveEffect,
  ReactiveFlags,
  activeEffect,
  effect,
  reactive,
  track,
  trigger
};
//# sourceMappingURL=reactivity.js.map
