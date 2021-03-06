import { isObject } from "@vue/shared";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags } from "./reactive";
import { isRef } from "./ref";

export const mutableHandlers = {
  // 代理对象的get方法，拦截代理对象的读取属性操作。
  get(target, key, receiver) {
    if (key == ReactiveFlags.IS_REACTIVE) return true;

    // const fullname = computed({});
    // const state = reactive({ name: "yweimao", fullname });
    // 取值 state.fullname.value 可以简写为 state.fullname computed类似
    if (isRef(target[key])) return target[key].value;

    //如果在取值的时候发现取出来的值是对象,那么再次进行代理，返回代理后的结果
    if (isObject(target[key])) {
      return reactive(target[key]);
    }
    // receiver表示代理对象
    // 我们使用proxy要搭配 reflect来使用， 解决this的指向问题
    const res = Reflect.get(target, key, receiver);
    // 当我们取值的时候，这个属性要和effect产生关联
    // 依赖收集，记录属性和当前effect的关系
    track(target, key);
    return res;
  },
  // 代理对象的set方法，拦截代理对象的设置操作。
  set(target, key, value, receiver) {
    const oldValue = target[key];
    //代理对象设置新值
    const r = Reflect.set(target, key, value, receiver);
    // 更新数据
    // 找到这个属性对应的effect，并让他执行
    if (oldValue !== value) {
      trigger(target, key, value, oldValue);
    }

    return r;
  },
};
