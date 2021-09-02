// Angular
import { Injectable } from '@angular/core';
// App
import { IDialog } from '@app/ts/interface';

import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/takeUntil';

@Injectable()
export class DialogStatusService {
  // 讀取圈的開啟狀態
  dialogContent: IDialog = {
    dtype: '',
    text: '',
    callback: undefined,
  };
  private dialogSubject: BehaviorSubject<object> = new BehaviorSubject(this.dialogContent);
  dialogContent$: Observable<object> = this.dialogSubject.asObservable();

  constructor(

  ) {

  }

  confirm(msg, callback) {
    this.dialogSubject.next({
      dtype: 'confirm',
      text: msg,
      callback: callback
    });
  }
  alert(msg) {
    this.dialogSubject.next({
      dtype: 'alert',
      text: msg,
      callback: undefined
    });
  }

  // open() {
  //   this.isOpen = true;
  //   this.isOpenSubject.next(true);
  // }

  // close() {
  //   this.isOpen = false;
  //   this.isOpenSubject.next(false);
  // }

}
