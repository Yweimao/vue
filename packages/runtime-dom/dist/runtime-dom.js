// packages/runtime-dom/src/nodeOps.ts
var nodeOps = {
  createElement(element) {
    return document.createElement(element);
  },
  createText(text) {
    return document.createTextNode(text);
  },
  insert(child, container, anchor = null) {
    container.insertBefore(child, anchor || null);
  },
  remove(child) {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  querySelector(selector) {
    return document.querySelectorAll(selector);
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  setText(node, text) {
    node.nodeValue = text;
  },
  nextSibling: (node) => node.nextSibling,
  createComment: (text) => document.createComment(text),
  parentNode: (node) => node.parentNode
};

// packages/runtime-dom/src/modules/attr.ts
function patchAttr(el, key, nextVal) {
  if (nextVal) {
    el.setAttribute(key, nextVal);
  } else {
    el.removeAttribute(key);
  }
}

// packages/runtime-dom/src/modules/class.ts
function patchClass(el, nextVal) {
  if (nextVal == null) {
    el.removeAttribute("class");
  } else {
    el.className = nextVal;
  }
}

// packages/runtime-dom/src/modules/event.ts
function createInvoker(nextVal) {
  const fn = (e) => fn.value(e);
  fn.value = nextVal;
  return fn;
}
function patchEvent(el, rawName, nextVal) {
  const invokers = el._vei || (el._vei = {});
  const eventName = rawName.slice(2).toLowerCase();
  const exititingInvoker = invokers[eventName];
  if (nextVal && exititingInvoker) {
    exititingInvoker.value = nextVal;
  } else {
    if (nextVal) {
      const invoker = invokers[eventName] = createInvoker(nextVal);
      el.addEventListener(eventName, invoker);
    } else if (exititingInvoker) {
      el.removeEventListener(eventName, exititingInvoker);
      invokers[eventName] = null;
    }
  }
}

// packages/runtime-dom/src/modules/style.ts
function patchStyle(el, preVal, nextVal) {
  const style = el.style;
  if (nextVal) {
    for (const key in nextVal) {
      style[key] = nextVal[key];
    }
  }
  if (preVal) {
    for (const key in preVal) {
      if (nextVal[key] == null) {
        style[key] = null;
      }
    }
  }
}

// packages/runtime-dom/src/patchProp.ts
function patchProp(el, key, preVal, nextVal) {
  if (key === "class") {
    patchClass(el, nextVal);
  } else if (key === "style") {
    patchStyle(el, preVal, nextVal);
  } else if (/^on[^a-z]/.test(key)) {
    patchEvent(el, key, nextVal);
  } else {
    patchAttr(el, key, nextVal);
  }
}

// packages/runtime-core/src/renderer.ts
function createRenderer(renderOptions2) {
  const {
    createElement: hostCreateElement,
    createText: hostCreateText,
    insert: hostInsert,
    remove: hostRemove,
    querySelector: hostQuerySelector,
    setElementText: hostSetElementText,
    setText: hostSetText,
    nextSibling: hostNextSibling,
    createComment: hostCreateComment,
    parentNode: hostParentNode,
    patchProp: hostPatchProp
  } = renderOptions2;
  const render2 = (vnode, container) => {
    console.log(renderOptions2, vnode, container);
  };
  return { render: render2 };
}

// packages/shared/src/index.ts
var isObject = (val) => {
  return val !== null && typeof val === "object";
};
var isFunction = (val) => {
  return typeof val === "function";
};
var isString = (val) => {
  return typeof val === "string";
};

// packages/runtime-core/src/createVNode.ts
function isVNode(value) {
  return !!value.__v_isVNode;
}
function createVNode(type, props, children = null) {
  const shapeFlag = isString(type) ? 1 /* ELEMENT */ : 0;
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children,
    key: props == null ? void 0 : props.key,
    el: null,
    shapeFlag
  };
  if (children) {
    let type2 = 0;
    if (Array.isArray(children)) {
      type2 = 16 /* ARRAY_CHILDREN */;
    } else {
      vnode.children = String(children);
      type2 = 8 /* TEXT_CHILDREN */;
    }
    vnode.shapeFlag |= type2;
  }
  return vnode;
}

// packages/runtime-core/src/h.ts
function h(type, propsOrchildren, children) {
  const l = arguments.length;
  if (l == 2) {
    if (isObject(propsOrchildren) && !Array.isArray(propsOrchildren)) {
      if (isVNode(propsOrchildren)) {
        return createVNode(type, null, [propsOrchildren]);
      }
      return createVNode(type, propsOrchildren);
    } else {
      return createVNode(type, null, propsOrchildren);
    }
  } else {
    if (l > 3) {
      children = Array.from(arguments).slice(2);
    }
    if (l == 3 && isVNode(children)) {
      children = [children];
    }
    return createVNode(type, propsOrchildren, children);
  }
}

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
    this.__v_isRef = true;
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
var objectRefImpl = class {
  constructor(_object, _key) {
    this._object = _object;
    this._key = _key;
    this.__v_isRef = true;
  }
  get value() {
    return this._object[this._key];
  }
  set value(newValue) {
    this._object[this._key] = newValue;
  }
};
function toRef(object, key) {
  return new objectRefImpl(object, key);
}
function toRefs(object) {
  const ret = Array.isArray(object) ? new Array(object.length) : /* @__PURE__ */ Object.create(null);
  for (const key in object) {
    ret[key] = toRef(object, key);
  }
  return ret;
}
function proxyRefs(object) {
  return new Proxy(object, {
    get(target, key, receiver) {
      const v = Reflect.get(target, key, receiver);
      return isRef(v) ? v.value : v;
    },
    set(target, key, value, receiver) {
      const oldValue = Reflect.get(target, key, receiver);
      if (isRef(oldValue)) {
        oldValue.value = value;
        return true;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    }
  });
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

// packages/runtime-dom/src/index.ts
var renderOptions = Object.assign(nodeOps, { patchProp });
function createRenderer2(renderOptions2) {
  return createRenderer(renderOptions2);
}
function render(vnode, container) {
  const renderer = createRenderer2(renderOptions);
  return renderer.render(vnode, container);
}
export {
  ReactiveEffect,
  ReactiveFlags,
  activeEffect,
  computed,
  createRenderer2 as createRenderer,
  createVNode,
  dowatch,
  effect,
  h,
  isReactive,
  isRef,
  isVNode,
  proxyRefs,
  reactive,
  ref,
  render,
  toReactive,
  toRef,
  toRefs,
  track,
  trackEffect,
  trigger,
  triggerEffect,
  watch,
  watchEffect
};
//# sourceMappingURL=runtime-dom.js.map
