export let activeEffect = undefined;

function cleanupEffect(effect) {
  const { deps } = effect;
  for (let i = 0; i < deps.length; i++) {
    // 找到set，让set移除自己
    deps[i].delete(effect);
  }
  effect.deps.length = 0;
}
export class ReactiveEffect {
  // 默认会将fn挂载到类的实例上面
  // 等价于 private fn; this.fn = fn;
  constructor(private fn, public scheduler?) {}
  parent = undefined;
  deps = [];
  active = true;
  run() {
    try {
      if (!this.active) {
        return this.fn();
      }
      /**
       * 解决嵌套effect
       * effect(() => {
       *   app.innerHTML = state.name;
       *  effect(() => {
       *   app.innerHTML = state.age;
       *  })
       *   effect(() => {
       *    app.innerHTML = state.age;
       *  })
       *    app.innerHTML = state.address;
       * })
       */
      this.parent = activeEffect;
      activeEffect = this;
      // 清理了上一次的依赖收集
      cleanupEffect(this);

      return this.fn(); // fn() 会进行依赖收集
    } finally {
      // 副作用函数执行完清空当前activeEffect
      activeEffect = this.parent;
      this.parent = undefined;
    }
  }
  stop() {
    if (this.active) {
      this.active = false;
      cleanupEffect(this);
    }
  }
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  _effect.run();
  //把runner函数返回出去，让用户可以调用effect中自定义的内容
  const runner = _effect.run.bind(_effect);
  // 可以通过runner拿到effect实例
  runner.effect = _effect;

  return runner;
}

// weakmap : map : set
// {"name": 'ywm'} : 'name' : [effect1,effect2,effect3]
//                 : 'age'  : [effect1,effect2,effect3]

const targetMap = new WeakMap();
export function track(target, key) {
  // 让这个对象上的属性，记录当前的activeEffect
  if (activeEffect) {
    // 说明用户实在effect函数中执行

    //判断当前属性是否进行依赖收集
    let depsMap = targetMap.get(target);
    //如果没有进行依赖收集，那么创建一个wekmap集合
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    // 如果已经有了这个集合，判断当前key是否被收集
    let dep = depsMap.get(key);
    // 如果没有被收集,则创建属性对应的副作用函数集合  'name' : [effect1,effect2,...]
    if (!dep) {
      depsMap.set(key, (dep = new Set()));
    }
    // 判断当前属性是否有副作用函数的集合
    trackEffect(dep);
  }
}

export function trackEffect(dep) {
  const shouldTrack = !dep.has(activeEffect);
  if (shouldTrack) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}

export function trigger(target, key, newValue, oldValue) {
  // 通过对象找到对应的属性，让这个属性对应的effect重新执行
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  triggerEffect(dep);
}

export function triggerEffect(dep) {
  const effects = [...dep];
  effects &&
    effects.forEach((effect) => {
      if (effect !== activeEffect) {
        // 用户自己手动调度执行
        if (effect.scheduler) {
          effect.scheduler();
        } else {
          effect.run();
        }
      }
    });
}
