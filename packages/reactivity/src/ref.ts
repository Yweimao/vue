import { isObject } from "@vue/shared";
import { reactive } from "./reactive";
import { trackEffect, trigger, triggerEffect } from "./effect";

export function isRef(val) {
  return !!(val && val["__v_isRef"]);
}

export function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}

class RefImpl {
  public _value;
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
