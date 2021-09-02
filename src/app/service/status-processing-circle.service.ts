// Angular
import { Injectable } from '@angular/core';
// App
import { IBetFile } from '@app/ts/interface';

import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/takeUntil';

@Injectable()
export class ProcessingCircleStatusService {
  // 讀取圈的開啟狀態
  isOpen: boolean = false;
  private isOpenSubject: BehaviorSubject<boolean> = new BehaviorSubject(this.isOpen);
  isOpen$: Observable<boolean> = this.isOpenSubject.asObservable();

  private mixingBetEventSubj: Subject<boolean> = new Subject();
  mixingBetEvent$ = this.mixingBetEventSubj.asObservable();

  constructor(

  ) {

  }


  open() {
    this.isOpen = true;
    this.isOpenSubject.next(true);
  }

  close() {
    this.isOpen = false;
    this.isOpenSubject.next(false);
  }

}
