// Angular
import { Injectable } from '@angular/core';
// App
import { Ball, appBalls, IAppBalls } from '@app/ts/ball';
import { Play, PlayType, playUpdateTime } from '@app/ts/play';
// Service
import { ApiService } from '@service/api.service';
import { BallQuantityService } from '@service/ball-quantity.service';
// RxJS
import { Observable } from 'rxjs/Observable';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { DEFAULT } from '@app/app.config';
import 'rxjs/add/operator/switchMap'; 
import 'rxjs/add/operator/filter';

let LimitTypes = DEFAULT.LimitTypes || [];
let appB = [...appBalls].filter(ball => {
  if (LimitTypes.indexOf(ball.value) >= 0) {
    return false;
  }
  return true;
});
const ballOpts_ALL: PlayType<IAppBalls[]>
  = new PlayType(appB, appB, appB);

@Injectable()

export class BallOptionService {
  constructor(
    private ballQuantity: BallQuantityService
  ) { }

  /**
   * 取得開賽球種 及 數量
   * @param uid
   * @param play
   */
  getBallOptions(play: Play): Observable<any> {
    const formatBallOptions = (quantity) => {

      // 在後端 API 單式賽事數量欄位為 'ALL'
      let _play: Play | 'ALL' = play;
      if (play === Play.single) { _play = 'ALL'; }

      return Observable.from(ballOpts_ALL[play])
        .map((option: IAppBalls) => {
          option['count'] = quantity[option.value][_play];
          option['content'] = quantity[option.value];
          return option;
        })
        .filter(option => option.count > 0);
    };

    return this.ballQuantity.getBallQuantity().switchMap(formatBallOptions);
  }


}
