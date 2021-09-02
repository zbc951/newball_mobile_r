/**
 * 非同步執行
 */
export function useAsync(callback) {
  setTimeout(() => {
    callback();
  }, 10);
}
