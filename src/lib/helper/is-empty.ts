/**
 * 判斷是否為空物件
 */
export function isEmptyObject(obj) {
  for (const key in obj) { return false; }
  return true; // 是空的
}

/**
 * 判斷是否為陣列
 * @param value
 */
export function isArray(value) {
  return Object.prototype.toString.call(value) === '[object Array]';
}
