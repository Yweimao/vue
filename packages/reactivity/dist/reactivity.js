// packages/shared/src/index.ts
var isObject = (val) => {
  return val !== null && typeof val === "object";
};
var isFunction = (val) => {
  return typeof val === "function";
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
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.parent = void 0;
    this.deps = [];
    this.active = true;
  }
  run() {
    try {
      if (!this.active) {
        return this.fn();
      }
      this.parent = activeEffect;
      activeEffect = this;
      cleanupEffect(this);
      return this.fn();
    } finally {
      activeEffect = this.parent;
      this.parent = void 0;
    }
  }
  stop() {
    if (this.active) {
      this.active = false;
      cleanupEffect(this);
    }
  }
};
function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  _effect.run();
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
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
    trackEffect(dep);
  }
}
function trackEffect(dep) {
  const shouldTrack = !dep.has(activeEffect);
  if (shouldTrack) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}
function trigger(target, key, newValue, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap)
    return;
  const dep = depsMap.get(key);
  triggerEffect(dep);
}
function triggerEffect(dep) {
  const effects = [...dep];
  effects && effects.forEach((effect2) => {
    if (effect2 !== activeEffect) {
      if (effect2.scheduler) {
        effect2.scheduler();
      } else {
        effect2.run();
      }
    }
  });
}

// packages/reactivity/src/ref.ts
function isRef(val) {
  return !!(val && val["__v_isRef"]);
}
function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}
var RefImpl = class {
  constructor(rawValue) {
    this.rawValue = rawValue;
    this.dep = /* @__PURE__ */ new Set();
    this._value = toReactive(rawValue);
  }
  get value() {
    trackEffect(this.dep);
    return this._value;
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      this.rawValue = newValue;
      this._value = toReactive(newValue);
      triggerEffect(this.dep);
    }
  }
};
function ref(value) {
  return new RefImpl(value);
}

// packages/reactivity/src/handler.ts
var mutableHandlers = {
  get(target, key, receiver) {
    if (key == "__v_isReactive" /* IS_REACTIVE */)
      return true;
    if (isRef(target[key]))
      return target[key].value;
    if (isObject(target[key])) {
      return reactive(target[key]);
    }
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
  if (target["__v_isReactive" /* IS_REACTIVE */]) {
    return target;
  }
  if (exitingProxy)
    return exitingProxy;
  const proxy = new Proxy(target, mutableHandlers);
  reaceiveMap.set(target, proxy);
  return proxy;
}
function isReactive(val) {
  return val["__v_isReactive" /* IS_REACTIVE */];
}

// packages/reactivity/src/apiWatch.ts
function traverse(val, seen = /* @__PURE__ */ new Set()) {
  if (!isObject(val))
    return val;
  if (seen.has(val))
    return val;
  seen.add(val);
  for (let key in val) {
    traverse(val[key], seen);
  }
  return val;
}
function watchEffect(source, options) {
  dowatch(source, null, options);
}
function watch(source, cb, options) {
  dowatch(source, cb, options);
}
function dowatch(source, cb, options) {
  let getter;
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
      if (clear)
        clear();
      let newVal = effect2.run();
      cb(newVal, oldVal, onCleanup);
      oldVal = newVal;
    } else {
      effect2.run();
    }
  }
  const effect2 = new ReactiveEffect(getter, job);
  oldVal = effect2.run();
}

// packages/reactivity/src/computed.ts
var ComputedRefImpl = class {
  constructor(getter, setter) {
    this.setter = setter;
    this._dirty = true;
    this.dep = /* @__PURE__ */ new Set();
    this.__v_isRef = true;
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        triggerEffect(this.dep);
      }
    });
  }
  get value() {
    trackEffect(this.dep);
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run();
    }
    return this._value;
  }
  set value(newVal) {
    this.setter(newVal);
  }
};
function computed(getterOrOptions) {
  let getter;
  let setter;
  const isGetter = isFunction(getterOrOptions);
  if (isGetter) {
    getter = getterOrOptions;
    setter = () => {
      console.log("warning:");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
}
export {
  ReactiveEffect,
  ReactiveFlags,
  activeEffect,
  computed,
  dowatch,
  effect,
  isReactive,
  isRef,
  reactive,
  ref,
  toReactive,
  track,
  trackEffect,
  trigger,
  triggerEffect,
  watch,
  watchEffect
};
//# sourceMappingURL=reactivity.js.map
