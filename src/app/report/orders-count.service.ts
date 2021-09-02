import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class OrdersCountService {

  private orderCountSub = new ReplaySubject(1);
  orderCount$ = this.orderCountSub.asObservable();
  updateCount(count) {
    this.orderCountSub.next(count);
  }

}
