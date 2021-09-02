// Angular
import { Injectable } from '@angular/core';
// storage
import { SessionStorage } from 'lib/storage';

@Injectable()

export class UidStatusService {
  //儲存目前uid的狀態
  private _uid: string;

  get uid(): string {
    this._uid = SessionStorage.getItem('uid');
    return this._uid;
  }

  set uid(uid: string) {
    if (uid) {
      SessionStorage.setItem('uid', uid);
    } else {
      SessionStorage.removeItem('uid');
    }

    this._uid = uid;
  }

  hasUid(): boolean {
    return !!!this._uid;
  }

  clear() {
    this.uid = null;
  }

}
