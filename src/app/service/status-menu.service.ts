// Angular
import { Injectable } from '@angular/core';
// RxJS
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class StatusMenuService {
  private statusSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isOpen$: Observable<boolean> = this.statusSubject.asObservable();
  open() {
    this.statusSubject.next(true);
  }
  close() {
    this.statusSubject.next(false);
  }

}
