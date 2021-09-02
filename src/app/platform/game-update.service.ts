// Angular
import { Injectable } from '@angular/core';
// Service
import { ApiService } from '@service/api.service';
import { NameChartService } from '@service/name-chart.service';
// App
import { combineFirstHalf, doCombine } from '@app/ts/combine-half';
import { reshapeGame } from '@app/ts/games-reshape';
import { Ball } from '@app/ts/ball';
import { IGame } from '@app/ts/game';
// RxJs
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/filter';

@Injectable()
export class GameUpdateService {

  private gameSubject: Subject<IGame> = new Subject();
  game$: Observable<IGame> = this.gameSubject.asObservable();

  constructor(
    private api: ApiService,
    private nameChart: NameChartService
  ) { }

  // getGame(gameReq: string, ball: Ball) {
  //   return Observable.timer(0, 5000).switchMap(this.update(gameReq, ball));
  // }
  /**
   * 取得單筆賽事資料
   * @param gameReq 
   * @param ball 
   */
  getGameQuick(gameReq: string, ball: Ball) {
    return this.api.postServer(125, { games: gameReq }, false)
      .map(res => Object.values(res.ret))
      .filter(GameServer => GameServer.length !== 0)
      .map(GameServer => GameServer[0][0])
      .map(_serverData => {

        let game = _serverData.R;
        const gameHR = _serverData.HR;
        game.picthers = this.getPicthers(ball)(game)
        if (!!!gameHR || !!!gameHR.b5) { return game; }

        const spiltHR_b5 = gameHR.b5.split('_');
        const HR_id = Number(spiltHR_b5[0]);
        const HR_half = Number(spiltHR_b5[1]);

        if (game.b === HR_id) {
          game = doCombine(HR_half, game, gameHR);
          game['gameID' + HR_half] = gameHR.b;
      }
        return game;
      });
  }

  // update = (gameReq: string, ball: Ball) => () => {
  //   return this.api.postServer(125, { games: gameReq }, false)
  //     .map(res => Object.values(res.ret))
  //     .filter(GameServer => GameServer.length !== 0)
  //     .map(GameServer => GameServer[0][0])
  //     .map(_serverData => {
  //       let game = _serverData.R;
  //       const gameHR = _serverData.HR;
  //       game.picthers = this.getPicthers(ball)(game)
  //       if (!!!gameHR || !!!gameHR.b5) { return game; }

  //       const spiltHR_b5 = gameHR.b5.split('_');
  //       const HR_id = Number(spiltHR_b5[0]);
  //       const HR_half = Number(spiltHR_b5[1]);

  //       if (game.b === HR_id) {
  //         game = doCombine(HR_half, game, gameHR);
  //         game['gameID' + HR_half] = gameHR.b;
  //       }

  //       return game;
  //     })
  //     .map(reshapeGame(ball));
  // }
  private getPicthers = (ball: Ball) => (game) => {
    const picthers = 
      this.nameChart.transPicthersSync(ball, {picther_H: game.a9, picther_C: game.a8});
    return picthers;
  }

}
