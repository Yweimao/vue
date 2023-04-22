import { patchClass } from "./modules/class";
import { patchStyle } from "./modules/style";

export function patchProp(el, key, preVal, nextVal) {
  // class、 style、 on 开头的属性、普通属性

  if (key === "class") {
    patchClass(el, nextVal); // 对类名的处理
  } else if (key === "style") {
    patchStyle(el, preVal, nextVal); // 样式处理
  }
}
