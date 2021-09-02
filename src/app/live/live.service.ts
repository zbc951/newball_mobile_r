// Angular
import { Injectable } from '@angular/core';
// App
import { IGame } from '@app/ts/game';
import { Ball } from '@app/ts/ball';
import { ApiService } from '@service/api.service';
import { NameChartService } from '@service/name-chart.service';
import { UidStatusService } from '@service/status-uid.service';
import { ConfigSetService } from '@app/service/config-set.service';
import { DEFAULT, RouterPath } from '@app/app.config';
// Live
import { LiveStoreService } from './live-store.service';
// RxJS
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/from';

import { ILiveData } from 'ts/interface';

@Injectable()
export class LiveService {

  constructor(
    private api: ApiService,
    private uidStatus: UidStatusService,
    private nameChart: NameChartService,
    private configSet: ConfigSetService,
    private liveStore: LiveStoreService
  ) { }
    //是否為雷速訊號
    VIDEO_leisu = DEFAULT.VIDEO_leisu;
    //雷速訊號.VIDEO_leisu=true 跑221 舊訊號 false 跑211
    gateway =(DEFAULT.VIDEO_leisu)?221:211;

  /**
   * 取得直播賽事列表
   */
  getLiveData(): Observable<ILiveData[]> {

    const liveFile: ILiveData[] = this.liveStore.get();
    if (liveFile) { return Observable.of(liveFile); }

    const req = { uid: this.uidStatus.uid, className: 'W108', lang: this.configSet.lang };
    const timeFill0 = (n) => ((n < 10) ? `0${n}` : `${n}`);
    return this.api.postServer(this.gateway, req, false)
      .switchMap(res => res.ret as ILiveData[])

      .map(liveGame => {
        switch (liveGame.file) {
          case 'usa': liveGame.file = 'us';
            break;
          case 'japan': liveGame.file = 'jp';
            break;
          default:
            break;
        }

        return liveGame;
      })
      // .filter(liveGame => {
      //   const file = liveGame.file;
      //   if (liveGame.video.length === 0) {
      //     return false;
      //   }
      //   const video = Number(liveGame.video);

      //   const noneUSA: boolean = file === 'us' && video > 10;
      //   const noneJP: boolean = file === 'jp' && video > 6;
      //   if (noneUSA || noneJP) { return false; }

      //   return true;
      // })
      .filter(liveGame => liveGame.video && liveGame.video.length > 0)
      .concatMap(async liveGame => {

        liveGame['league'] =
          await this.nameChart.transLeagueAsync(liveGame.gtype as Ball, liveGame.lid);

        return liveGame;
      })
      .map(liveGame => {
        const now = moment();
        const gameTime = moment(liveGame.tw_dt).valueOf();
        const isOpened: boolean = now > gameTime;

        liveGame['isOpened'] = isOpened; //是否開賽
        if(liveGame.rtmp == 'Y'){  //rtmp = Y 走新串流
          liveGame['videoID'] = liveGame.rtmp_date+'_' + liveGame.rtmpkey+'/'+liveGame.rtmpkey1 //影片ID
         
        }else{
          liveGame['videoID'] = liveGame.file + liveGame.video //影片ID
        }
      
        if (!isOpened) { //未開賽 計算剩餘時間
          let duration = moment.duration((gameTime - now), 'milliseconds');
          liveGame['leftTime'] = `${timeFill0(duration.hours())}:${timeFill0(duration.minutes())}:${timeFill0(duration.seconds())}`;
        }
       
        return liveGame;
      })
      .toArray()
      .do(this.liveStore.save);
  }

}
