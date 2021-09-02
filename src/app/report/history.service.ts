// Angular
import { Injectable } from '@angular/core';
// App
import { ApiService } from '@service/api.service';
import { UidStatusService } from '@service/status-uid.service';


import { ReportHistory, GoldSum, StartEndDate } from './interface';
import { ConfigSetService } from '@app/service/config-set.service';

@Injectable()
export class HistoryService {

  private uid = this.uidStatus.uid;
  constructor(
    private api: ApiService,
    private configSet: ConfigSetService,
    private uidStatus: UidStatusService,
  ) { }
  /**
   * 取得歷史注單資料
   * @param start 開始時間 EX:2018-06-27
   * @param end   結束時間 EX:2018-06-27
   */
  getBetHistory(start, end) {
    const req = { uid: this.uid, sdate: start, edate: end, gtype: '' };
    return this.api.postServer(106, req).map(apiRes => apiRes.ret.reverse())
  }

  // calHistoryTot(history: ReportHistory[]) {

  //   const tot = { totGold: 0, totEffectiveGold: 0, totWin: 0 };

  //   for (let i = 0, l = history.length; i < l; i++) {
  //     const item = history[i];

  //     tot.totGold += item.gold;
  //     tot.totEffectiveGold += item.effective_gold;
  //     tot.totWin += item.win * 100 + item.water * 100;
  //   }
  //   tot.totWin = tot.totWin / 100;
  //   return tot;
  // }
  /**
   * 取得日期注單資料
   * @param date 要取得資料的日期 EX: 2018-05-12
   */
  getBetHistoryDetail(date) {
    const req = { uid: this.uid, date: date, gtype: '', lang:this.configSet.lang };
    return this.api.postServer(107, req).map(apiRes => apiRes.ret.reverse())
  }
}
