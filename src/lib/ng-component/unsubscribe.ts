import { Basic } from './basic';
import { Observable } from 'rxjs/observable';
import { Subject } from 'rxjs/Subject';

export class UnSubscribe extends Basic {
  public unSubscribe: Subject<void> = new Subject();
  constructor() { super(); }
  ngOnDestroy() {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }

}
