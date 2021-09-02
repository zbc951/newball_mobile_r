/**
 * 取得 url 參數
 * @param name 參數名
 */
export function getURLParameter(name) {
  const url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) { return null; }
  if (!results[2]) { return ''; }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
// Usage:
// query string: ?foo=lorem&bar=&baz
// var foo = getURLParamet('foo'); // "lorem"
// var bar = getURLParamet('bar'); // "" (present with empty value)
// var baz = getURLParamet('baz'); // "" (present with no value)
// var qux = getURLParamet('qux'); // null (absent)
