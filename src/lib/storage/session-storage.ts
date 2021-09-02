import { getURLParameter } from '../helper/url';
declare const STORAGE_MODE: boolean;

export class SessionStorage {
  static memoStore = {};

  static setItem(key: string, value: any) {
    value = JSON.stringify(value);
    if (STORAGE_MODE) {
      sessionStorage.setItem(key, value);
    } else {
      SessionStorage.memoStore[key] = value;
      // location.href = `?${key}=${value}`;
    }
  }
  static getItem(key: string): any {
    let item;
    if (STORAGE_MODE) {
      item = sessionStorage.getItem(key);
    } else if (key === 'uid'){
      if (SessionStorage.memoStore[key]) {
        return JSON.parse(SessionStorage.memoStore[key]);
      } else {
        let uid = SessionStorage.getGETparam('uid');
        if (uid) {
          SessionStorage.memoStore[key] = uid;
          return JSON.parse(SessionStorage.memoStore[key]);
        } else {
          return JSON.parse('0');
        }
      }
      // item = getURLParameter(key);
    } else {
      if (SessionStorage.memoStore[key]) {
        return JSON.parse(SessionStorage.memoStore[key]);
      } else {
        return JSON.parse('0');
      }
    }
    return JSON.parse(item);
  }
  static removeItem(key: string) {
    if (STORAGE_MODE) {
      sessionStorage.removeItem(key);
    } else {
      delete SessionStorage.memoStore[key]
      // location.href = '';
    }
  }
  static getGETparam(key) {
    let strUrl = location.search;
    let getPara;
    if (strUrl.indexOf("?") != -1) {
      let getSearch = strUrl.split("?");
      getPara = getSearch[1].split("&");
      for (let i = 0; i < getPara.length; i++) {
        let ParaVal = getPara[i].split("=");
        if (ParaVal[0] === key) {
          return ParaVal[1];
        }
      }
    }
    return false;
  }

}
