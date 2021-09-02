declare const STORAGE_MODE: boolean;

export class LocalStorage {
  static setItem(key: string, value: any) {
    if (!!!STORAGE_MODE) { return; }
    localStorage.setItem(key, JSON.stringify(value));
  }
  static getItem(key: string): any {
    if (!!!STORAGE_MODE) { return; }
    return JSON.parse(localStorage.getItem(key));
  }
  static removeItem(key: string) {
    if (!!!STORAGE_MODE) { return; }
    localStorage.removeItem(key);
  }
}
