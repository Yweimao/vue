export const isObject = (val) => {
  return val !== null && typeof val === "object";
};
export const isFunction = (val) => {
  return typeof val === "function";
};
export const isString = (val) => {
  return typeof val === "string";
};

export * from "./shapeFlag";
