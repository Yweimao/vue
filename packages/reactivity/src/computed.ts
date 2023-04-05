import { isFunction } from "@vue/shared";
import { ReactiveEffect, trackEffect, triggerEffect } from "./effect";

class ComputedRefImpl {
  public effect;
  public _value;
  public _dirty = true; // computed缓存逻辑
  public dep = new Set();
  public __v_isRef = true;
  constructor(getter, public setter) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true; // 依赖的值发生变化了，会将dirty设置为true

        // 当依赖的值发生变化了，也应该触发更新
        triggerEffect(this.dep);
      }
    });
  }

  get value() {
    // 在取值时，要对计算属性也进行依赖收集  取值操作： fullname.value;
    //  effect(() => {
    //     app.innerHTML = fullname.value;
    //   });

    trackEffect(this.dep);

    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run(); // this._value就是取值后的结果
    }

    return this._value;
  }
  set value(newVal) {
    this.setter(newVal);
  }
}
export function computed(getterOrOptions) {
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
