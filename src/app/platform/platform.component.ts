// Angular
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild, NgZone } from '@angular/core';
import { Router, RouterState  } from '@angular/router';
// App
import { Ball, appBalls } from 'ts/ball';
import { IGame } from 'ts/game';
import { ILiveData } from 'ts/interface';
import { currentProcess, ICurrentChatRoom, IVote } from 'ts/chat-room';
import { reshapeGame } from '@app/ts/games-reshape';
// Service
import { MemberService } from '@service/store-member.service';
import { StatusPlatformService, IPlatformTeam } from '@service/status-platform.service';
import { ChatService, IRoom, IMsg, VoteSide } from '@shared-chat/chat.service';
// Platform
import { GameUpdateService } from '@platform/game-update.service';
// lib
import { UnSubscribe } from 'lib/ng-component';
// RxJs
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ScoreService, IScore } from '@app/service/score.service';
import { loader } from 'lib/loader';
import { TransOdds, TransBet} from 'ts/translate-value';

import { DEFAULT, RouterPath } from '@app/app.config';
import { PlayStatusService } from '@app/service/status-play.service';
import { Play } from 'ts/play';

import { BetStatusService } from '@service/status-bet.service';
import { UidStatusService } from '@service/status-uid.service';
import { ConfigSetService } from '@app/service/config-set.service';
import { ApiService } from '@service/api.service';
import { constructDependencies } from '@angular/core/src/di/reflective_provider';

@Component({
  selector: 'app-platform',
  templateUrl: './platform.component.html',
  styleUrls: ['./platform.component.scss'],

  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PlatformComponent extends UnSubscribe implements OnInit, ICurrentChatRoom {
  // 直播影片的位址
  VIDEO_PATH = DEFAULT.VIDEO_PATH;
  // 直播影片的位址 雷速
  VIDEO_PATH_leisu = DEFAULT.VIDEO_PATH_leisu;
  //是否為雷速訊號
  VIDEO_leisu = DEFAULT.VIDEO_leisu;
  // 投票選項
  VoteSide = VoteSide;
  // 賽事ID
  private gameReq: string = this.statusPlatform.platformData.gameReq;
  // 目前賽事的球種
  useBall: Ball = this.statusPlatform.platformData.ball;
  // 賽事及隊伍資料
  teamInfo: IPlatformTeam = this.statusPlatform.platformData.teamInfo;
  // 直播編號
  videoID: string = this.statusPlatform.platformData.videoID;
  // 迅雷
  rtmp: boolean = this.statusPlatform.platformData.rtmp == 'Y';
  //時間的小時
  time_hh:number = parseInt(this.teamInfo.time.substring(11,13));
  // 該賽事的詳細下注資料
  game: IGame;
  // 該賽事比分
  score: IScore;
  // 聊天訊息
  messages: IMsg[];
  // 玩法賠率陣列
  handicapAry = [];
  // 最新聊天訊息
  newMsg = null;
  // 主隊支持數
  hVote;
  // 客隊支持數
  gVote;
  // 賽事更新倒數單位時間
  defaultCountDown: number = 10;
  // 賽事更新倒數時間
  countDown: number = 10;
  // 是否還留在此頁面
  isAlive:boolean = true;
  // vote: IVote = { home: 0, guest: 0 };
  // 玩法種類
  Play = Play;
  // 是否開啟即時注單
  betDetailActive: boolean = false;
  // 即時注單資料
  orders = [];
  // 語系
  DEFAULT_Lang = DEFAULT.LANG;

  @ViewChild('platform') private platform: ElementRef;
  // @ViewChild('voteH') private voteH: ElementRef;
  // @ViewChild('voteG') private voteG: ElementRef;
  private timerUnSubscribe: Subscription;
  private chatSubscribe: Subscription;
  private votingSubscribe: Subscription;
  constructor(
    public statusPlatform: StatusPlatformService,
    public playStatus: PlayStatusService,
    private gameUpdate: GameUpdateService,
    private chatService: ChatService,
    private scoreService: ScoreService,
    private cd: ChangeDetectorRef,
    private router: Router,
    public member: MemberService,
    private betStatus: BetStatusService,
    private api: ApiService,
    private uidStatus: UidStatusService,
    private configSet: ConfigSetService,
    private ngZone: NgZone
  ) {
    super();
    super.ngOnDestroy();
  }

  ngOnInit() {
    this.messages = [];
    this.startGameUpdate();
    this.router.events.takeWhile(it => this.isAlive).subscribe((event) => {
        this.closePlatform();
    });
    if (this.videoID) {
      this.addChatRoom(this.videoID);
    }
  }
  ngAfterViewInit() {
    if (this.videoID) {
      this.votingListener(this.videoID);
    }
  }
  ngOnDestroy() {
    if (this.videoID) {
      this.chatSubscribe.unsubscribe();
      this.votingSubscribe.unsubscribe();
    }
    this.isAlive = false;
  }
  /**
   * 初始化
   */
  private startGameUpdate() {
    // this.openPlatform();
    this.updateGame();
    this.chatService.getVote(this.videoID);
    this.checkCountDown();
  }
  /**
   * 更新賽事倒數
   */
  private checkCountDown() {
    setTimeout(() => {
      this.countDown--;
      if (this.countDown === 0) {
        this.chatService.getVote(this.videoID);
        this.countDown = this.defaultCountDown;
        this.updateGame();
      }
      this.cd.markForCheck();
      if (this.isAlive) {
        this.checkCountDown();
      }
    }, 1000);
  }
  /**
   * 取得賽事資料
   */
  // private getGame() {
  //   this.timerUnSubscribe = this.gameUpdate.getGame(this.gameReq, this.useBall)
  //     .takeUntil(this.unSubscribe)
  //     .subscribe(game => {
  //       // loader.close();
  //       let useBallData = this.getBallTypeData(this.useBall);
  //       this.handicapAry = this.updateMoreDetail(useBallData.LiveDetailAry, game.handicaps);
  //       this.game = game;
  //       this.getScore();
  //       // this.openPlatform();
  //       this.cd.markForCheck();
  //     });
  // }
  /**
   * 更新賽事資料
   */
  refresh() {
    this.chatService.getVote(this.videoID);
    this.countDown = this.defaultCountDown;
    this.updateGame();
    this.cd.markForCheck();
  }
  //取得指定球種資料
  private getBallTypeData(ball) {
    for (let i = 0; i < appBalls.length; i++) {
      if (ball === appBalls[i].value) {
        return appBalls[i];
      }
    }
    return appBalls[0];
  }
  /**
   * 取得比分
   */
  private getScore() {
    const ball = this.game.ball;
    const gameID = this.game.gameID;
    const reqBall = [ball];
    const reqGid = [ball + '_' + gameID];
    this.scoreService.getScore(reqBall, reqGid)
      .filter(ret => ret[ball])
      .map(ret => ret[ball][String(gameID)])
      .subscribe(score => {
        this.score = score;
        this.cd.markForCheck();
      })
  }
  /**
   * 監聽聊天訊息
   */
  private addChatRoom(room: string) {

    // this.chatService.addRoom(room);
    // 監聽聊天訊息
    this.chatSubscribe = this.chatService.currentRoom$
      .takeUntil(this.unSubscribe)
      // .filter(currentRoom => currentRoom.name === room)
      .filter(currentRoom => {
        if (currentRoom.protocol == 4) {
          this.newMsg = currentRoom.data;
        }
        return true;
      })
      .subscribe(currentProcess.bind(this));
  }
  /**
   * 監聽主客隊支持變動
   * @param room
   */
  private votingListener(room: string) {
    this.votingSubscribe = this.chatService.voting$
      .takeUntil(this.unSubscribe)
      .subscribe(voteObject => {

        this.hVote = voteObject.currentVote_H;
        this.gVote = voteObject.currentVote_G;
        setTimeout(() => {
          this.cd.markForCheck();
        }, 100);
      });
  }
  /**
   * 進行主客隊支持投票
   * @param side
   */
  sendVote(side: VoteSide) {
    if (this.videoID) {
      this.chatService.addVote(this.videoID, side);
    }
  }


  openPlatform() {
    // this.platform.nativeElement.classList.add('trans');
  }
  /**
   * 關閉直播視窗
   */
  closePlatform() {
    // this.platform.nativeElement.classList.remove('trans');
    setTimeout(() => this.statusPlatform.close(), 300);
  }



  /**
   * 修改賽事資料成支援顯示的格式
   * @param detailAry
   * @param handicaps
   */
  private updateMoreDetail(detailAry, handicaps) {
    let moreDataList = [];
    let mapping = ['F', 'U', 'D'];
    for (let i = 0; i < detailAry.length; i++) {
      let res2 = this.changeFormat(detailAry[i], handicaps);
      if (res2.hasData || i == 0) {
        moreDataList.push({
          part: mapping[i],
          data: res2.retData,
          titles: detailAry[i]
        });
      }
    }
    return moreDataList;
  }

  /* 轉換遊戲賠率格式 */
  private changeFormat(format, handicapsData) {
    let hasData = false;
    let tempAry:Array<any> = [{side: 'H'}, {side: 'C'}];
    let mapping = ['H', 'C'];
    for (let i = 0; i < format.length; i++) {
      let found = handicapsData.filter(d => d.type == format[i]);
      for (let map = 0; map < mapping.length; map++) {
        if (found.length > 0) {
          let oddData = found[0];

          if (oddData['odds_' + mapping[map]]) {
            hasData = true;
          }
          if (oddData['odds_' + mapping[map]] == 0) {
            tempAry[map][format[i]] = {
              head: '',
              odd: '',
              side: oddData['side_' + mapping[map]],
              strong: oddData.strong,
            }
          } else {
            tempAry[map][format[i]] = {
              head: oddData.head,
              odd: oddData['odds_' + mapping[map]],
              side: oddData['side_' + mapping[map]],
              strong: oddData.strong,
            }
          }

        } else {
          tempAry[map][format[i]] = {
            head: '',
            odd: '',
            side: '',
            strong: '',
          }
        }
      }
      if (found.length > 0) {
        let oddData = found[0];
        if (oddData['odds_N']) {
          hasData = true;
        }
        if (format[i] == 'M') {
          let tmpObj = {side: 'N'};
          for(let p = 0; p < format.length; p++){
            tmpObj[format[p]] = {};
          }
          tmpObj['M'] = {
            head: '',
            odd: oddData['odds_N'],
            side: oddData['side_N'],
            strong: oddData.strong
          }
          if (oddData['odds_N']) {
            tempAry.push(tmpObj);
          }
        }
      }
    }

    return {
      hasData: hasData,
      retData: tempAry
    }
  }
  /**
   * 設置下注資料 顯示下注視窗
   * @param teamInfo
   * @param handicap
   * @param play
   */
  setBet(teamInfo, handicap, play) {
    if (!handicap.odd) return;
    this.betStatus.setBetLive(teamInfo, handicap, play, this.useBall);
  }
  /**
   * 更新賽事資料
   */
  updateGame(){
    this.gameUpdate.getGameQuick(this.gameReq, this.useBall)
      .subscribe(game => {
        game = reshapeGame(this.useBall)(game);
        let useBallData = this.getBallTypeData(this.useBall);
        this.handicapAry = this.updateMoreDetail(useBallData.LiveDetailAry, game.handicaps);
        this.game = game;
        this.getScore();
        this.cd.markForCheck();
      });
  }

  // getHandicap(handicaps, play, side) {
  //   for (let i = 0; i < handicaps.length;i++) {
  //     let part = handicaps[i];
  //     if (part && part.data) {
  //       let fitSide = part.data.filter(p => p.side === side)[0];
  //       if (fitSide && fitSide[play]) {
  //         return fitSide[play];
  //       }
  //     }
  //   }
  // }

  /**
   * 開啟/關閉即時注單視窗
   */
  toggleDetail() {
    if (this.betDetailActive) {
      this.betDetailActive = false;
    } else {
      this.getOrders();
    }
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
   * 分析即時注單資料
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
   * 取得注單結果
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
   * @param value
   * @param gtype
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
    console.log(this.DEFAULT_Lang);
    switch (gtype) {
      case 'FT':
        if (this.DEFAULT_Lang == 'zh-cn'){
          return this.chgcon(fr, bk);
        }
        return this.setHead(fr, bk);
      default: return this.setHead(fr, bk);
    }
    // return this.setHead(fr, bk);
  }
  /**
   * 轉換足球球頭
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
   * 轉換一般球頭
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
