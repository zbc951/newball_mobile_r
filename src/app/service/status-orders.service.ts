// Angular
import { Injectable } from '@angular/core';
// RxJS
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
//
import { LocalStorage } from 'lib/storage';

@Injectable()
export class OrderRemindService {

  private count: number = LocalStorage.getItem('orderCount') || 0;
  private countSubject: BehaviorSubject<number> = new BehaviorSubject(this.count);
  count$ = this.countSubject.asObservable();

  constructor() { }

  add() {
    this.count++;
    this.setCount();
  }
  clear() {
    this.count = 0;
    this.setCount();
  }
  hasNewOrders(): boolean {
    return !!!this.count;
  }
  private setCount() {
    this.countSubject.next(this.count);
    LocalStorage.setItem('orderCount', this.count);
  }

}
