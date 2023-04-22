function createInvoker(nextVal) {
  const fn = (e) => fn.value(e);
  fn.value = nextVal;
  return fn;
}

export function patchEvent(el, rawName, nextVal) {
  // vue event invoker
  const invokers = el._vei || (el._vei = {});
  // 函数名
  const eventName = rawName.slice(2).toLowerCase();
  // 看一下是否绑定过这个事件
  const exititingInvoker = invokers[eventName];

  if (nextVal && exititingInvoker) {
    //有新值，并且绑定过事件，需要换绑
    exititingInvoker.value = nextVal;
  } else {
    if (nextVal) {
      // 没有绑定过事件
      const invoker = (invokers[eventName] = createInvoker(nextVal));

      el.addEventListener(eventName, invoker);
    } else if (exititingInvoker) {
      // 没有新值，但是之前绑定过事件了
      el.removeEventListener(eventName, exititingInvoker);
      invokers[eventName] = null;
    }
  }
}
