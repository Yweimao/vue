import { isObject } from "@vue/shared";
import { reactive } from "./reactive";
import { trackEffect, triggerEffect } from "./effect";

export function isRef(val) {
  return !!(val && val["__v_isRef"]);
}

// 普通对象转换成代理对象
export function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}

class RefImpl {
  public _value;
  public __v_isRef = true;
  public dep = new Set();
  constructor(public rawValue) {
    this._value = toReactive(rawValue);
  }

  get value() {
    //进行依赖收集
    trackEffect(this.dep);
    return this._value;
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      this.rawValue = newValue;
      this._value = toReactive(newValue);
      // 触发更新
      triggerEffect(this.dep);
    }
  }
}

// ref一般处理的是基本类型
export function ref(value) {
  return new RefImpl(value);
}

class objectRefImpl {
  // 将某个属性转成ref值
  public __v_isRef = true;
  constructor(private _object, private _key) {}
  get value() {
    // 触发依赖收集 state.name = 'xxx'
    return this._object[this._key];
  }
  set value(newValue) {
    // 触发更新
    this._object[this._key] = newValue;
  }
}

export function toRef(object, key) {
  return new objectRefImpl(object, key);
}

export function toRefs(object) {
  const ret = Array.isArray(object)
    ? new Array(object.length)
    : Object.create(null);
  for (const key in object) {
    // 将每一项全部转化成ref类型
    ret[key] = toRef(object, key);
  }
  return ret;
}

export function proxyRefs(object) {
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
    },
  });
}
