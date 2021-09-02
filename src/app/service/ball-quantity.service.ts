// Angular
import { Injectable } from '@angular/core';
// Service
import { ApiService } from '@service/api.service';
import { UidStatusService } from '@service/status-uid.service';
// RxJS
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/observable/timer';
import { Subscription } from 'rxjs/Subscription';
import { DEFAULT } from '@app/app.config';
@Injectable()
export class BallQuantityService {

  private ballQuantitySubj: ReplaySubject<any> = new ReplaySubject(1);
  private subscription: Subscription;
  constructor(
    private api: ApiService,
    private uidStatus: UidStatusService,
  ) { }
  /**
   * 取得目前各球種賽事數量
   */
  getBallQuantity(): Observable<any> {
    this.ballQuantityTimer();
    return this.ballQuantitySubj;
  }
  /**
   * 更新球種數量
   */
  private ballQuantityTimer() {
    if (!!this.subscription) { return; }

    this.subscription = Observable.timer(0, 15000)
      .do(() => {
        if (!!!this.uidStatus.uid) { this.subscription.unsubscribe(); }
      })
      .switchMap(() =>
        this.api.postServer(154, { uid: this.uidStatus.uid }, false)
          .map(apiRes =>{

            // if(DEFAULT.LANG == 'ja-jp'){ //限制日本板球總
            //   for (const key in apiRes.ret) {
            //     if(key == 'FT' || key == 'BS' || key == 'JB'|| key == 'BK'){

            //     }else{
            //       apiRes.ret[key].ALL = 0;
            //       apiRes.ret[key].MPR = 0;
            //       apiRes.ret[key].RE = 0;
            //     }
            //   }

            // }
           // console.log(apiRes.ret);
            return apiRes.ret;

          } )
      )
      .subscribe(this.ballQuantitySubj);
  }
}
