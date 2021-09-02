// Angular
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
// App
import { IGame } from '@app/ts/game';
import { StatusPlatformService, IPlatformTeam } from '@service/status-platform.service';
import { ChatService, IRoom, IMsg } from '@shared-chat/chat.service';
import { UidStatusService } from '@service/status-uid.service';
import { ConfigSetService } from '@app/service/config-set.service';
import { ApiService } from '@service/api.service';
// Live
import { LiveService } from '@live/live.service';
import { ScoreService, IScore } from '@app/service/score.service';
// RxJS
import { Observable } from 'rxjs/Observable';
import { takeUntil } from 'rxjs/operators';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/toPromise';
import { TransOdds, TransBet } from 'ts/translate-value';

import { RouterPath, DEFAULT } from '@app/app.config';
import { ILiveData } from 'ts/interface';
import { currentProcess, ICurrentChatRoom, IVote } from 'ts/chat-room';
import { UnSubscribe } from 'lib/ng-component';
import { Ball } from '@app/ts/ball';
import { Subscriber } from 'rxjs/Subscriber';
import { Subscription } from 'rxjs/Subscription';

const ROOM_HALL: string = '_public';
@Component({
  selector: 'app-live',
  templateUrl: './live.component.html',
  styleUrls: ['./live.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveComponent extends UnSubscribe implements OnInit, ICurrentChatRoom {
  // 監聽目前鎖在房間的聊天訊息
  private currentRoomSubscribe: Subscription;
  // 監聽所有房間人數的訊息
  private everyRoomSubscribe: Subscription;
  // 監聽直播聊天畫面的開啟關閉狀態
  private platformSubscribe: Subscription;
  // 各間房間的人數  EX: {room1:21 , room2: 14, _public: 55}
  private roomStore: any;
  // 聊天室內的訊息
  messages: IMsg[] = [];
  // 已經開賽的直播
  openedLive: ILiveData[] = [];
  // 還未開賽的直播
  closeLive: ILiveData[] = [];
  // 全部賽事
  AllliveData: ILiveData[] = [];
  //過濾聯盟
  
  filterLeague:any={
    'gtypes':'',
    'league':''
  };
  // 最新的聊天訊息
  newMsg = null;
  // 大廳房間名稱 key
  roomHall = ROOM_HALL;
  // 是否還留在此頁面
  isAlive:boolean = true;
  // 比分
  scores = {};
  // 更新人數的倒數
  updateOnlineCountDown: number = 10;
  // 倒數的單位時間
  defaultOnlineCountDown: number = 10;
  // 未開賽賽事進度條的基準時間 (超過這時間為0%)
  percentHour: number = 24; //未開賽直播的進度條以幾個小時為基準
  // 未開賽賽事進度條的時間 (毫秒)
  percentMS = 0;
  // 路由路徑
  RouterPath = RouterPath;
  // 即時注單顯示開關
  betDetailActive: boolean = false;

  //聯盟視窗
  leagueActive: boolean = false;

  // 語系
  DEFAULT_Lang = DEFAULT.LANG;
  // 即時注單資料內容
  orders = [];
  constructor(
    private liveService: LiveService,
    private statusPlatform: StatusPlatformService,
    private chatService: ChatService,
    private scoreService: ScoreService,
    private api: ApiService,
    private uidStatus: UidStatusService,
    private configSet: ConfigSetService,
    private cd: ChangeDetectorRef
  ) {
    super();
    super.ngOnDestroy();
  }

  ngOnInit() {
    this.platformListener();
    this.checkOnline();
    this.addChatRoom();
    this.chatService.getOnlines();
    // this.chatService.getRoomList();
    this.percentMS = this.percentHour * 60 * 60 * 1000;
  }
  ngOnDestroy() {
    this.leaveChatRoom();
    this.everyRoomSubscribe && this.everyRoomSubscribe.unsubscribe();
    this.platformSubscribe && this.platformSubscribe.unsubscribe();
    this.isAlive = false;
  }
  /**
   * 每秒確認倒數狀態
   */
  private checkOnline() {
    this.updateNonOpenTime();
    this.updateOnlineCountDown--;
    if (this.updateOnlineCountDown <= 0) {
      this.updateOnlineCountDown = this.defaultOnlineCountDown;
      this.chatService.getOnlines();
      // this.chatService.getRoomList();
    }
    setTimeout(() => {
      if (this.isAlive) {
        this.checkOnline();
      }
    }, 1000);
  }
  /**
   * 監聽直播畫面開啟狀態
   */
  private platformListener() {
    const subscriber = (isOpen) => {
      if (isOpen) { this.leaveChatRoom(); }
      else {
        this.getLiveData();
        this.chatService.addRoom(ROOM_HALL, true);
      }
    };
    this.platformSubscribe = this.statusPlatform.isOpen$
      .takeUntil(this.unSubscribe)
      .subscribe(subscriber);
  }
  /**
   * 監聽聊天訊息
   */
  private addChatRoom() {

    // this.chatService.addRoom(room);

    // 監聽聊天訊息
    this.currentRoomSubscribe = this.chatService.currentRoom$
      .takeUntil(this.unSubscribe)
      .filter(currentRoom => {
        if (currentRoom.protocol == 4) {
          this.newMsg = currentRoom.data;
        }
        return true;
      })
      .subscribe(currentProcess.bind(this));

  }
  /**
   * 聊天室離開大廳
   */
  private leaveChatRoom() {
    this.unSubscribe.complete();
    this.currentRoomSubscribe.unsubscribe();
  }
  /**
   * 取得直播賽事列表
   */
  private getLiveData() {
    this.liveService.getLiveData().subscribe(liveData => {
      this.getScores(liveData);
      Observable.from(liveData)
        .filter(liveGame => liveGame.isOpened)
        .toArray()
        .do(()=>this.AllliveData = liveData)
        .do(openedLive => this.openedLive = openedLive)
        .do(openedLive => {this.openedLive = this.filterSelect(this.openedLive)})
        .do(() => this.everyRoomListener())
        .subscribe();

      Observable.from(liveData)
        .filter(liveGame => !liveGame.isOpened)
        .toArray()
        .do(closeLive => this.closeLive = closeLive.sort((a,b) => moment(a.tw_dt).valueOf() - moment(b.tw_dt).valueOf()))
        .do(closeLive => {this.closeLive = this.filterSelect(this.closeLive)})
        .subscribe();
      this.cd.markForCheck();
    });
  }
  /**
   * 取得直播比賽分數
   * @param liveData
   */
  private getScores(liveData) {
    this.scoreService.getScore(
                      liveData.map(item => item.gtype).filter((type, index, self) => self.indexOf(type) === index),
                      liveData.map(item => item.gtype + '_' + item.id))
        .subscribe(res => {
          this.scores = {};
          Object.keys(res).forEach(ball => {
            // switch(ball) {
            //   case 'BK':
            //     let scoreDatas = res[ball];
            //     break;
            //   case 'FT':
            //     break;
            //   case 'BS':
            //     break;
            //   default:
            // }
            Object.keys(res[ball]).forEach(game => {
              this.scores[game] = res[ball][game];
            })
          });
        });
  }
  /**
   * 將小於10數字改為 0X 字串
   * @param n
   */
  timeFill0(n) {
    return ((n < 10) ? `0${n}` : `${n}`);
  }
  /**
   * 更新未開賽直播的剩餘時間
   */
  private updateNonOpenTime() {
    let now = moment();
    let update = false;
    for (let i = 0; i < this.closeLive.length; i++) {
      let live = this.closeLive[i];
      let durationS = moment(live.tw_dt).valueOf() - now;
      if (durationS < 0) {
        update = true;
      }
      let duration = moment.duration(durationS, 'milliseconds');
      let leftMS = this.percentMS - duration._milliseconds;
      if (leftMS > 0) {
        if (leftMS > this.percentMS) {
          live['leftPercent'] = 'scaleX(1)';
        } else {
          live['leftPercent'] = `scaleX(${(leftMS / this.percentMS).toFixed(2)})`;
        }
      } else {
        live['leftPercent'] = 'scaleX(0)';
      }
      live['leftTime'] = `${this.timeFill0(duration.days() * 24 + duration.hours())}:${this.timeFill0(duration.minutes())}:${this.timeFill0(duration.seconds())}`;
    }
    if (update) {
      this.getLiveData();
    } else {
      this.cd.markForCheck();
    }
  };

  /**
   * 監聽所有直播的房間人數
   */
  private everyRoomListener() {

    if (!!this.everyRoomSubscribe) {
      this.mergeOnline(); return;
    }

    this.everyRoomSubscribe = this.chatService.everyRoom$
      .takeUntil(this.unSubscribe)
      .do(roomStore => this.roomStore = roomStore.data)
      .do(() => this.mergeOnline())
      .subscribe();
  }

  /**
   * 將聊天人數與直播賽事資料合併
   */
  private mergeOnline() {
    this.openedLive.forEach(liveGame => {
      // console.log(liveGame);
      if (!this.roomStore) return;
      if (this.roomStore[liveGame.videoID]) { liveGame['online'] = this.roomStore[liveGame.videoID]; }
      else { liveGame['online'] = 0; }
      return liveGame;
    })
    this.cd.markForCheck();
  }
  /**
   * 開啟直播賽事畫面
   * @param liveGame
   */
  goPlatform(liveGame: ILiveData) {
    const platformTeam: IPlatformTeam = {
      league: liveGame.league,
      team_H: liveGame.team_id_h,
      team_C: liveGame.team_id_c,
      time: liveGame.tw_dt
    };
    this.statusPlatform.goPlatform(
      liveGame.gtype as Ball,
      liveGame.lid,
      liveGame.id,
      platformTeam,
      liveGame.videoID,
      liveGame.rtmp
    );
  }

  /**
   * 開啟/關閉即時注單
   */
  toggleDetail() {
    if (this.betDetailActive) {
      this.betDetailActive = false;
    } else {
      this.getOrders();
    }
  }
  /**開啟過濾聯盟視窗 */
  toggleDetailLeague(){
    if (this.leagueActive) {
      this.leagueActive = false;
    }else{
      this.leagueActive = true;
      // if(this.filterLeague['gtypes'] && this.filterLeague['league']){
      //   this.filterLeague['gtypes'] = '';
      //   this.filterLeague['league'] = '';
      //   this.getLiveData();
      // }
    }
    
  }
  /**記錄過濾聯盟*/
  filterEvent_l(_types,_val ){
    switch(_types){
      case'all':
        this.filterLeague['gtypes'] = '';
        this.filterLeague['league'] = '';
        this.leagueActive = false;
        this.getLiveData();
      break;
      case'gtypes':
        this.filterLeague['gtypes'] = _val;
        this.filterLeague['league'] = '';
      break;
      case'league':
        this.filterLeague['league'] = _val;
        if(this.filterLeague['gtypes'] && this.filterLeague['league']){
        this.getLiveData();
        this.leagueActive = false;
      break;
    }
     
      //leagueActive
    }
  }
  /**
   * 過濾聯盟
   */
  filterSelect(_val):any{
    const filter = [];
    if(this.filterLeague['gtypes'] && this.filterLeague['league']){
      _val.forEach(element => {
          if(element.gtypes == this.filterLeague['gtypes'] && element.league == this.filterLeague['league']){
          
            filter.push(element);
          }
      });
      return filter;
    }else{
      return _val;
    };


  }

  /**
   * 取得即時注單資料
   */
  private getOrders() {
    const req = { uid: this.uidStatus.uid, lang: this.configSet.lang };
    this.api.postServer(105, req)
      .map(res => res.ret)
      .subscribe(orders => {
        this.orders = orders.map(order => this.analysisOrder(order))
        this.betDetailActive = true;
        this.cd.markForCheck();
      });
  }
  /**
   * 解析注單資料
   * @param order
   */
  private analysisOrder(order) {
    switch(order.wtype) {
      case 'CPR':
        let tmpOdd = 1;
        let betAry = order.sub.map(minOrder => {
          let bet = order.orderContArr[minOrder.gid];
          let subWtype = minOrder.wtype;
          tmpOdd = Number((tmpOdd * (1 + Number(bet[7]))).toFixed(2));
          return {
            gameName: bet[0],
            partInfo: bet[1],
            bid: bet[2],

            team1: bet[3],
            head: (bet[4] && bet[4].length > 0) ? bet[4] : 'Vs.',
            team2: bet[5],
            betOption: bet[6],
            odd: bet[7],
            gameTime:  moment(bet[8]).format('MM/DD HH:mm'),
            team1Score: bet[9],
            team2Score: bet[10],
            subWtype: subWtype,
            active: false
          }
        });
        tmpOdd = tmpOdd - 1;
        order.betAry = betAry;
        order.betOption = order.orderContArr.cprLevel;
        order.odd = tmpOdd;
        order.betTime = moment(order.adddate).format('MM/DD HH:mm');
        order.wouldWin = Number((Number(order.gold) * Number(order.odd)).toFixed(2));
        break;
      default:
        order.gameName = order.orderCont[0];
        order.partInfo = order.orderCont[1];
        order.bid = order.orderCont[2];
        order.team1 = order.orderCont[3];
        order.head = (order.orderCont[4] && order.orderCont[4].length > 0)? order.orderCont[4] : 'Vs.';
        order.team2 = order.orderCont[5];
        order.betOption = order.orderCont[6];
        order.odd = order.orderCont[7];
        order.team1Score = order.orderCont[9];
        order.team2Score = order.orderCont[10];
        order.gameTime = moment(order.gdata.game_time).format('MM/DD HH:mm');
        order.betTime = moment(order.adddate).format('MM/DD HH:mm');
        order.wouldWin = Number((Number(order.gold) * Number(order.odd)).toFixed(2));
    }
    order.active = false;
    return order;
  }
  /**
   * 取得注單狀態
   * @param order
   */
  getResult(order) {
    switch (order.result) {
      case 999:
          return 'Report.Confirming'; //html更換為'賽事確認中'
      case '':
      case '0':
          return 'Report.NotLottery'; //html更換為'未開獎'
      case 'NC':
          return 'Report.Canceled'; //html更換為'註銷'
      case 'N':
          return 'Report.GameCanceled'; //html更換為'退回'
      case '3':
          return 'Report.Wait'; //html更換為'賽果待定'
      case 'CHK':
          return 'Report.confirming'; //html更換為'審核中'
      case 'NOA':
          return 'Report.bet_fail'; //html更換為'下注失敗'
      default:
          return (Number(order.wingold) + Number(order.wgold_dm)).toFixed(2) + ''; //html更換為可贏+退水
    }
  }
  chgcon(con, ratio) {
    let backstr;
    let tcon = parseInt(con);
    let tratio = parseInt(ratio);
    if (tcon == 0) {
      switch (tratio) {
        case 0:
          backstr = "0";
          break;
        case -50:
          backstr = "0/0.5";
          break;
        case -100:
          backstr = "0.5";
          break;
        default:
          backstr = "";
          break;
      }
    } else {
      switch (tratio) {
        case 0:
          backstr = tcon;
          break;
        case 50:
          backstr = tcon;
          tcon = tcon - 1;
          backstr = tcon + ".5/" + backstr;
          break;
        case 100:
          tcon = tcon - 1;
          backstr = tcon + ".5";
          break;
        case -50:
          backstr = tcon + "/" + tcon + ".5";
          break;
        case -100:
          backstr = tcon + ".5";
          break;
        default:
          backstr = "";
          break;
      }
    }
    return backstr;
  }
  /**
   * 轉換球頭
   */
  transHead(value, gtype) {

    if (/H\dC\d/.test(value)) return value.replace('H', '').replace('C', ':');
    if (value === undefined) { return '' };
    let fr;
    let bk;
    if (value.indexOf('+') > 0) {
      const t: any[] = value.split('+');
      fr = t[0] * 1;
      bk = t[1] * 1;
    } else if (value.indexOf('-') > 0) {
      const t: any[] = value.split('-');
      fr = t[0] * 1;
      bk = t[1] * -1;
    } else {
      return '';
    }
    switch (gtype) {
      case 'FT':
        if (this.DEFAULT_Lang == 'zh-cn') {
          return this.chgcon(fr, bk);
        }
        return this.setHead(fr, bk);
      default: return this.setHead(fr, bk);
    }
    // return this.setHead(fr, bk);
  }
  /**
   * 轉換足球球頭 (舊)
   * @param fr
   * @param bk
   */
  setFTHead(fr, bk) {
    if (fr == 0 && bk == -50)
      return '0/0.5';
    if (fr == 0 && bk == 50)
      return '0/0.5';
    if (bk == 100)
      return (fr - 1) + ".5";
    if (bk == 0)
      return fr;
    if (bk == 50)
      return (fr - 1) + ".5/" + fr;
    if (bk == -50)
      return fr + "/" + fr + ".5";
    if (bk > 0)
      return fr + "+" + bk;

    return fr + bk;
  }
  /**
   * 轉換球頭
   * @param fr
   * @param bk
   */
  setHead(fr, bk) {
    if (fr == 0 && bk == 0)
      return '0';
    if (bk == 0)
      return fr + TransBet[this.configSet.lang]['Same'];
    if (bk == 100)
      return (fr - 1) + '.5';
    if (bk < 0)
      return fr + '' + bk;
    return fr + '+' + bk;
  }

  transOddsName(type) {
    return TransOdds[this.configSet.lang][type];
  }
}
