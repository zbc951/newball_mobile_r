// Angular
import { Injectable } from '@angular/core';
// App
import { Play } from '@app/ts/play';
import { BetResCase, IbetRes, IBetSuccessFile } from '@app/ts/bet';
import { IBetFile } from '@app/ts/interface';
import { MemberService } from '@service/store-member.service';
import { ApiService } from '@service/api.service';
import { PlayStatusService } from '@service/status-play.service';
import { BallStatusService } from '@service/status-ball.service';
import { OrderRemindService } from '@service/status-orders.service';
import { UidStatusService } from '@service/status-uid.service';
// Bet
import { splitHead, splitResHead } from './split-head';
import { ConfigSetService } from '@service/config-set.service';
// RxJS
import { Observable } from 'rxjs/Observable';
import { DEFAULT } from '@app/app.config';
// import { tmpdir } from 'os';


@Injectable()
export class BetService {
  // uid
  private uid: string = this.uidStatus.uid;
  // 會員信用額度 / 金額
  memberSurplus: number = this.member.memberInfo.maxcredit;
  // 是否正在下注
  isBeting: boolean = false;
  constructor(
    private api: ApiService,
    private member: MemberService,
    private configSet: ConfigSetService,
    private uidStatus: UidStatusService,
    private playStatus: PlayStatusService,
    private orderRemind: OrderRemindService
  ) { }
  /**
   * 執行下注
   * @param gold 下注金額
   * @param betFile 下注資料
   */
  bet(gold: number, betFile: IBetFile | IBetFile[],autocheck:Boolean =false): Observable<IbetRes> {
    if (this.playStatus.play !== Play.mixing) {
      const file: IBetFile = betFile as IBetFile;
      const req = this.singleBetRequest(gold, file,autocheck)
      return this.proceedBet(req);
    } else {
      const file: IBetFile[] = betFile as IBetFile[];
      const req = this.mixingBetRequest(gold, file)
      return this.proceedBet(req);
    }
  }
  /**
   * 處理單筆(走地 單式)下注的post資料
   * @param gold
   * @param betFile
   */
  private singleBetRequest(gold: number, betFile: IBetFile,autocheck:Boolean =false) {

    // 球頭前後分離
    const head = splitHead(
      betFile.play,
      betFile.head,
      betFile.side,
      betFile.strong
    );
    let ptype = betFile.oddsType;
    if (ptype) {
      ptype = ptype.split('_')[0];
    }
    const req = {
      uid: this.uid,
      gid: betFile.gameID,
      sgtype: betFile.ball,
      RE: betFile.play === Play.grounder ? 1 : 0,
      SCORE_H: betFile.teamInfo.score_H || 0,
      SCORE_C: betFile.teamInfo.score_C || 0,
      // concede_bs: head['front'] || 0,  // 走地球頭-前 (棒球用)
      // radio_bs: head['back'] || 0,     // 走地球投-後 (棒球用)
      concede: head.front || 0,
      radio: head.back || 0,
      ioradio: betFile.odds,
      ptype: ptype,
      type: betFile.side,
      gold: gold,
      lang: this.configSet.lang,
      autocheck: autocheck
    };
    return req;
  }
  /**
   * 處理過關下注資料
   * @param gold
   * @param betFiles
   */
  private mixingBetRequest(gold: number, betFiles: IBetFile[]) {

    const req = {
      uid: this.uid,
      ptype: 'CPR',
      gtype: betFiles[0].ball,
      gold: gold,
      lang: this.configSet.lang,
      data: betFiles.map(_betFile => (
        {
          gid: _betFile.teamInfo.gameID,
          noH: _betFile.teamInfo.serial_H,
          noC: _betFile.teamInfo.serial_C,
          wtype: _betFile.oddsType,
          type: _betFile.side,
        }
      ))
    };

    return req;
  }


  /**
   * 開始執行下注
   * @param request post資料
   */
  private proceedBet(request: any): Observable<IbetRes> {
    if (this.isBeting) return;
    this.isBeting = true;
    const betRes: IbetRes = {
      case: null,
      file: null
    }
    return this.api.postServer(308, request).map(apiRes => apiRes.ret)
      .map(ret => {
        this.isBeting = false;
        /**
          [0] : 下注是否成功
          [1] : 下注金額
          [2] : 可贏金額
          [3] : 詳細下注賽事
          [4] : 注單ID
          [5] : 球種及下注遊戲
          [6] : 注單時間
          [7] : 詳細下注賽事(array) or {16625:[...]}
          [8] : 球種
          [9] : 玩法
        */
        if (ret[0] === 'order success') {
          if (DEFAULT.isCN && request.sgtype === 'FT' && request.RE === 1) {//中國版足球走地
            betRes.case = BetResCase.pleaseCheck;
            return betRes;
          }
          if (ret[4]) { //判斷是否有產生注單ID
            let time = ret[6];
            if (time) {
              time = moment(time).format('MM-DD HH:mm');
            }
            const betSuccessFile: IBetSuccessFile = {
              gold: ret[1],
              estGold: ret[2],
              detail: ret[3],
              betId: ret[4],
              betType: ret[5],
              time: time,
              gameDetail: this.analysisOrder(ret[7], ret[9]),
              ball: ret[8],
              betTypeOrg: ret[9]
            };
            betRes.case = BetResCase.success;
            betRes.file = betSuccessFile;
            // footer 新注單提醒
            this.orderRemind.add();
            // 更新會員
            this.member.updateMemberInfo();
          } else {
            betRes.case = BetResCase.noOid;
          }
          return betRes;
        } else if (ret[0]) { //下注失敗(錯誤)
          const change = ret[0].split('*');
          switch (change[0]) {
            // 更新賠率
            case 'ioratio':
              betRes.case = BetResCase.updateOdds;
              betRes.file = change[1];
              break;
            // 更新球頭
            case 'con':
              const head = splitResHead(change[1]);
              betRes.case = BetResCase.updateHead;
              betRes.file = head;
              break;
            case 'errorcode':
              betRes.case = BetResCase.others;
              betRes.file = ret[1];
              break;
            // 其他狀況
            default:
              betRes.case = BetResCase.others;
              betRes.file = ret[0];
              break;
          }
          return betRes;
        } else { //直接錯誤了
          betRes.case = BetResCase.totalError;
          return betRes;
        }
      });

  }
  /**
   * 分析注單內容
   * @param order 注單資料
   * @param betType
   */
  private analysisOrder(order, betType = '') {
    if (!order) {
      return;
    }
    let retAry = [];
    if (betType === 'CPR') {
      Object.keys(order).filter(key => key !== 'cprLevel').forEach(key => {
        let formatData = format(order[key]);
        if (formatData['bid']) {
          retAry.push(formatData);
        }
      });
    } else {
      retAry.push(format(order));
    }
    function format(data) {
      if (data.length == 11 || data.length == 12) {
        return {
          gameName: data[0],
          ms: data[1],
          bid: data[2],
          team1: data[3],
          head: data[4],
          team2: data[5],
          betOption: data[6],
          odds: data[7],
          gameTime: data[8],
          team1Score: data[9],
          team2Score: data[10],
          playType: data[11]
        };
      } else if (data[2]) {
        //資料為json形式
        let tmpData = Object.keys(data).map(key => data[key]);
        return {
          gameName: tmpData[0],
          ms: tmpData[1],
          bid: tmpData[2],
          team1: tmpData[3],
          head: tmpData[4],
          team2: tmpData[5],
          betOption: tmpData[6],
          odds: tmpData[7],
          gameTime: tmpData[8],
          team1Score: tmpData[9],
          team2Score: tmpData[10],
          playType: data[11]
        };
      } else {
        return {};
      }
    }
    return retAry;
  }
}
