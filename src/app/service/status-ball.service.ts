// Angular
import { Injectable } from '@angular/core';
// App
import { Ball } from '@app/ts/ball';
// RxJS
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ConfigSetService } from '@app/service/config-set.service';

@Injectable()
export class BallStatusService {
  // 目前系統球種
  private _ball: Ball = this.configSet.ball;
  private ballSubject: BehaviorSubject<Ball> = new BehaviorSubject(this._ball);
  ball$: Observable<Ball> = this.ballSubject.asObservable();

  constructor(private configSet: ConfigSetService) {
    this.changeBall(this._ball);
  }

  set ball(ball: Ball) {
    this._ball = ball;
    this.changeBall(ball);
    this.ballSubject.next(ball);
  }
  get ball(): Ball {
    return this._ball;
  }
  /**
   * 切換球種
   * @param ball 
   */
  private changeBall(ball: Ball) {
    switch (ball) {
      case Ball.WB: ball = Ball.BK; break;
      case Ball.KB: ball = Ball.BS; break;
      default: break;
    }
  }
}
