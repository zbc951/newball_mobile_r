export function reduceCalSum(field) {
  return function (pre, next) {
    return pre + Number(next[field]);
  }
}
