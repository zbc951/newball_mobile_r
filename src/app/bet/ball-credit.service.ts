// Angular
import { Injectable } from '@angular/core';
// App
import { Play } from '@app/ts/play';
import { Ball } from '@app/ts/ball';
import { ICredit, IBetFile } from '@app/ts/interface';
import { CreditService } from '@service/store-credit.service';
import { PlayStatusService } from '@app/service/status-play.service';
import { BallStatusService } from '@app/service/status-ball.service';
import { ApiService } from '@service/api.service';
import { ConfigSetService, Lang } from '@service/config-set.service';
class NameChart {
   Ball = {} as Ball;
}
@Injectable()
export class BallCreditService {
  private nameChart: NameChart = new NameChart();
  sp_lid : any = {};
  constructor(
    private credit: CreditService,
    private playStatus: PlayStatusService,

    private ballStatus: BallStatusService,
    private api: ApiService,
    private configSet: ConfigSetService,
  ) {
    this.api.postServer(181, { lang: this.configSet.lang })
      .map(res => res.ret)
      .do((nameChart: NameChart) => {
        this.nameChart = nameChart['league'];

        for (const key in this.nameChart) {
          if (Object.prototype.hasOwnProperty.call(this.nameChart, key)) {
            const element = this.nameChart[key];
              if(element[0]){
                let arr_key = element[0].split(',')
                arr_key.forEach(lid => {
                  if(!!! this.sp_lid[key] ){
                    this.sp_lid[key] = [];
                  }

                  this.sp_lid[key].push( element[lid]);
                });
              }
          }
        }
      })
      .subscribe();

  }
  //取得該筆注單限額
  getCredits(betFile?: IBetFile) {

    let creditType: string;
    let creditTypeRE: string;
    let creditBall: Ball | string = this.ballStatus.ball;
    // console.log(betFile);
    const ballProcess = () => {
      const isHalf = betFile.oddsType.indexOf('_') !== -1;
      const league = betFile.teamInfo.league;
      if (isHalf) {
        switch (creditBall) {
          case Ball.BK: creditBall = 'BH'; break;
          case Ball.BS: creditBall = 'BF'; break;
          case Ball.JB: creditBall = 'JF'; break;
          case Ball.CB: creditBall = 'CF'; break;
          default: break;
        }
      } else if (
        creditBall === Ball.BK &&
        league.indexOf('第') !== -1 && league.indexOf('節') !== -1
      ) {
        creditBall = 'BQ'
      }
    }
    if (this.sp_lid[creditBall] && this.sp_lid[creditBall].indexOf(betFile.teamInfo.league) >= 0) {
      creditBall = creditBall + '_S'
    }
    if (this.playStatus.play === Play.mixing) {
      // MPR 取信用額度，在後段參數是 CPR
      creditType = 'CPR'
    } else if(betFile) {
      // 單式/滾球才有 betFile 存在
      ballProcess();

        if (betFile.oddsType.split('_')[0] === 'R') {
          creditTypeRE = 'RE';
        } else {
          creditTypeRE = 'R' + betFile.oddsType.split('_')[0]
        }

        creditType = betFile.oddsType.split('_')[0]

        //預留共用版 使用
      return this.credit.getBallCredits(creditBall)
      .map(credit => ({
        RESC: credit['SC_' + creditTypeRE],
        RESO: credit['SO_' + creditTypeRE],
        SC: credit['SC_' + creditType],
        SO: credit['SO_' + creditType]
      } as ICredit)
      );
    }

   
    return this.credit.getBallCredits(creditBall)
      .map(credit => ({
        SC: credit['SC_' + creditType],
        SO: credit['SO_' + creditType]
      } as ICredit)
      );
  }

}
