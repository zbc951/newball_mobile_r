// Angular
import { Injectable } from '@angular/core';
// App
import { Ball } from '@app/ts/ball';
// RxJS
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export interface IPlatformTeam {
  league: string,
  team_H: string,
  team_C: string,
  time: string
}
export interface IPlatformData {
  ball: Ball;
  videoID: string;
  gameReq: string;
  teamInfo: IPlatformTeam,
  rtmp: string
}

@Injectable()

export class StatusPlatformService {

  private statusSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isOpen$: Observable<boolean> = this.statusSubject.asObservable();
  platformData: IPlatformData = {} as IPlatformData;
  /**
   * 設置直播視窗資訊並開啟視窗
   * @param ball 球種
   * @param lid 聯盟ID
   * @param gid 賽事ID
   * @param teamInfo 隊伍資料
   * @param videoID 影片ID
   */
  goPlatform(ball: Ball, lid: string, gid: string, teamInfo: IPlatformTeam, videoID: string, rtmp: string) {
    this.platformData.gameReq = `${ball}.${lid}.${gid}`;
    this.platformData.ball = ball;
    this.platformData.videoID = videoID;
    this.platformData.teamInfo = teamInfo;
    this.platformData.rtmp = rtmp;
    this.open();
  }
  private open() {
    this.statusSubject.next(true);
  }
  close() {
    this.statusSubject.next(false);
  }

}
