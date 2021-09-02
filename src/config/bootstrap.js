/**
 * 自適應 FontSize
 */
// var adaptiveFontSize = function () {

//   var innerWidth = window.innerWidth;

//   if (innerWidth >= 1366) {
//     // 150px(自己抓) / 100 * 320
//     width = 480;
//   } else if (innerWidth >= 768) {
//     // 130px(自己抓) / 100 * 320
//     width = 416;
//   } else if (innerWidth <= 320) {
//     // 最小 100px
//     width = 320;
//   } else {
//     width = innerWidth;
//   }

//   var fontSize = 100 * (width / 320);
//   document.documentElement.style.fontSize = fontSize + 'px';
// };
// adaptiveFontSize();
// window.onresize = adaptiveFontSize;


/**
 * 偵測瀏覽器是否支援 localStorage
 */
var STORAGE_MODE; // localStorage 是否啟用
if (typeof localStorage === 'object') {
  try {
    localStorage.setItem('storageTest', '1');
    localStorage.removeItem('storageTest');
    STORAGE_MODE = true;
  } catch (e) {

    Storage.prototype._setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function () { };
    STORAGE_MODE = false;
    // alert('您的瀏覽器版本可能較舊，或正在使用無痕模式瀏覽，建議更新您的瀏覽器，以達到更好的使用體驗。');
  }
}


/**
 * 依寬度定義裝置
 */
var _DEVICE = { mobile: false, tablet: false };
var defineDevice = function () {
  if (window.innerWidth < 768) {
    _DEVICE.mobile = true;
    _DEVICE.tablet = false;
  } else {
    _DEVICE.mobile = false;
    _DEVICE.tablet = true;
  }
}
defineDevice();
