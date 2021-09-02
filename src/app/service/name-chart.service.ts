// Angular
import { Injectable } from '@angular/core';
// App
import { Ball } from '@app/ts/ball';
import { ApiService } from '@service/api.service';
import { UidStatusService } from '@service/status-uid.service';
import { ConfigSetService, Lang } from '@service/config-set.service';
// RxJS
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import { noUndefined } from '@angular/compiler/src/util';

class NameChart {
  league: Ball = {} as Ball;
  picthers: Ball = {} as Ball;
  team: Ball = {} as Ball;
}
interface IBallNameChart {
  league: any[];
  team: any[];
}
interface ITeamIdItem {
  ID_H: string;
  ID_C: string;
}
interface ITeamNameItem {
  name_H: string;
  name_C: string;
}

@Injectable()
export class NameChartService {
  private uid: string = this.uidStatus.uid;
  //語言對照表
  private nameChart: NameChart = new NameChart();
  constructor(
    private api: ApiService,
    private uidStatus: UidStatusService,
    private configSet: ConfigSetService,
  ) {
    this.isLangChange();
  }
  /**
   * 語言改變監聽
   */
  private isLangChange() {
    this.configSet.langChange$.subscribe((lang: Lang) => {
      this.nameChart = new NameChart();
      this.getAllNameChart();
    });
  }


  /**
   * 抓語言對照表(全部)
   */
  getAllNameChart() {
    this.api.postServer(181, { lang: this.configSet.lang })
      .map(res => res.ret)
      .do((nameChart: NameChart) => this.nameChart = nameChart)
      .subscribe();
  }

  /**
   * 抓語言對照表(特定球種)
   */
  private getBallNameChart(ball: Ball): Observable<IBallNameChart> {

    const req = { uid: this.uid, lang: this.configSet.lang, gtype: ball };

    return this.api.postServer(182, req, false)
      .map(res => res.ret)
      .do((nameChart: NameChart) => {
        this.nameChart.league[ball] = nameChart.league[ball];
        this.nameChart.picthers[ball] = nameChart.picthers[ball];
        this.nameChart.team[ball] = nameChart.team[ball];
      });
  }
  /**
   * 轉換聯盟名稱
   * @param ball 球種
   * @param lid  聯盟id
   */
  transLeagueSync(ball: Ball, lid: string): string {

    const ballNameChart: IBallNameChart = this.nameChart.league[ball] || {};
    const league: string = ballNameChart[lid] || undefined;

    return league;
  }
  /**
   * 轉換隊伍名稱
   * @param ball 球種
   * @param teamIdItem 隊伍id 
   */
  transTeamSync(ball: Ball, teamIdItem: ITeamIdItem) {

    const ballNameChart: IBallNameChart = this.nameChart.team[ball] || {};
    const teamName: ITeamNameItem = {} as ITeamNameItem;
    teamName.name_H = ballNameChart[teamIdItem.ID_H] || undefined;
    teamName.name_C = ballNameChart[teamIdItem.ID_C] || undefined;

    return teamName;
  }
  /**
   * 轉換投手名稱
   * @param ball 球種
   * @param picthersItem 主客隊投手資料
   */
  transPicthersSync(ball: Ball, picthersItem) {
    let picthers = {picther_H: null, picther_C:null};

    const pictherNameChart = this.nameChart.picthers[ball] || {};

    picthers.picther_H = pictherNameChart[picthersItem.picther_H] || undefined;
    picthers.picther_C = pictherNameChart[picthersItem.picther_C] || undefined;

    return picthers;
  }
  /**
   * 轉換聯盟名稱 (async)
   * @param ball 球種
   * @param lid  聯盟id
   */
  async transLeagueAsync(ball: Ball, lid: string): Promise<string> {
    if (!lid) {
      return;
    }
    let league = this.transLeagueSync(ball, lid);
    if (!league) {
      await this.getBallNameChart(ball).toPromise();
      league = this.transLeagueSync(ball, lid);
    }
    return league;
  }
  /**
   * 轉換隊伍名稱 (async)
   * @param ball 球種
   * @param teamIdItem 隊伍id 
   */
  async transTeamAsync(ball: Ball, teamIdItem: ITeamIdItem): Promise<ITeamNameItem> {

    let teamName = this.transTeamSync(ball, teamIdItem);

    if (!!!teamName) {
      await this.getBallNameChart(ball).toPromise();
      teamName = this.transTeamSync(ball, teamIdItem);
    }
    return teamName;
  }
  /**
   * 轉換投手名稱 (async)
   * @param ball 球種
   * @param picthersItem 主客隊投手資料
   */
  async transPicthersAsync(ball: Ball, picthersItem): Promise<any> {

    let picthers = this.transPicthersSync(ball, picthersItem);

    if (!picthers) {
      await this.getBallNameChart(ball).toPromise();
      picthers = this.transPicthersSync(ball, picthersItem);
    }
    return picthers;
  }

}
