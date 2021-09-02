// Angular
import { Injectable } from '@angular/core';
// App
import { IBetFile } from '@app/ts/interface';
import { Play } from '@app/ts/play';
import { PlayStatusService } from '@app/service/status-play.service';
import { BallStatusService } from '@app/service/status-ball.service';

import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/takeUntil';

@Injectable()
// 控制下注畫面的service
export class BetStatusService {
  //下注畫面是否開啟
  isOpen: boolean = false;
  //處理下注畫面開關的subject
  private isOpenSubject: BehaviorSubject<boolean> = new BehaviorSubject(this.isOpen);
  isOpen$: Observable<boolean> = this.isOpenSubject.asObservable();

  //單筆下注的下注資料
  singleBetFile: IBetFile;
  //過關下注的下注資料
  mixingBetFiles: IBetFile[] = [];
  //處理過關數量的subject
  private mixingBetEventSubj: Subject<boolean> = new Subject();
  mixingBetEvent$ = this.mixingBetEventSubj.asObservable();

  constructor(
    private playStatus: PlayStatusService,
    private ballStatus: BallStatusService
  ) {
    this.ballStatus.ball$.subscribe(ball => this.mixingBetFiles = [])
  }

  /**
   * 設置下注資料
   * @param teamInfo 聯盟及隊伍資訊
   * @param handicap 賠率
   * @param play 下注的玩法
   * @param type 下注的模式 圓盤, 走地, 過關
   * @param ball 下注的球種 
   */
  setBet(teamInfo, handicap, play, type = null, ball = null) {
    let gameID = teamInfo.gameID;
    if (teamInfo['gameID' + play.substr(-1)]) { //如果玩法是上半下半 則套用上半或下半的gid EX: 上半讓分 R_1 =>則取 teamInfo.gameID1
      gameID = teamInfo['gameID' + play.substr(-1)];
    }

    var betType = type || this.playStatus.play;
    var betBall = ball || this.ballStatus.ball;
    
    const betFile: IBetFile = {
      teamInfo: teamInfo, //聯盟及隊伍資訊
      gameID: gameID, //下注用的gid
      oddsType: play, //下注玩法 EX: R OU
      strong: handicap.strong, // 強隊
      head: handicap.head, //球頭
      odds: handicap.odd, // 賠率
      side: handicap.side, // 選擇的邊
      play: betType, // 目前的模式 圓盤, 走地, 過關
      ball: betBall, // 球種
      nweBet:null
    };

    
    /**
     * 當為過關時的處理程序
     */
    const mixingBetProcess = () => {
      const idx = this.mixingBetFiles
        .findIndex(_betFiles => _betFiles.teamInfo.gameID === teamInfo.gameID);

      if (idx === -1) {
        this.mixingBetFiles = [...this.mixingBetFiles, betFile];
      } else if (this.isSameBetFile(this.mixingBetFiles[idx], betFile)) {
        this.mixingBetFiles.splice(idx, 1);
      } else {
        this.mixingBetFiles[idx] = betFile;
      }
      this.mixingBetEventSubj.next(true);
    }

    switch (this.playStatus.play) {

      case Play.single: case Play.grounder:
        this.singleBetFile = betFile;
        console.log(betFile);
        this.mixingBetFiles = [];
        this.open();
        break;

      case Play.mixing:
        this.singleBetFile = undefined;
        mixingBetProcess();
        break;
      default:
        break;
    }

  }
  /* 設置直播畫面的下注資訊 */
  setBetLive(teamInfo, handicap, play, ball) {
    let gameID = teamInfo.gameID;
    if (teamInfo['gameID' + play.substr(-1)]) {
      gameID = teamInfo['gameID' + play.substr(-1)];
    }
    const betFile: IBetFile = {
      teamInfo: teamInfo,
      gameID: gameID,
      oddsType: play,
      strong: handicap.strong,
      head: handicap.head,
      odds: handicap.odd,
      side: handicap.side,
      play: Play.grounder,
      ball: ball,
      nweBet:null
    };
    this.singleBetFile = betFile;
    this.mixingBetFiles = [];
    this.open();

  }
  /**
   * 過關下注-取消單筆賽事
   * @param betFile 
   */
  cancelMixingBetFile(betFile: IBetFile) {
    this.mixingBetFiles =
      this.mixingBetFiles.filter(_betFile => _betFile.gameID !== betFile.gameID);
    this.mixingBetEventSubj.next(true);
  }
  /**
   * 過關下注-取消所有賽事
   */
  cancelAllMixingBetFile() {
    this.mixingBetFiles = [];
    this.mixingBetEventSubj.next(true);
  }
  /**
   * 比對下注資料是否相同
   * @param betFile1 
   * @param betFile2 
   */
  private isSameBetFile(betFile1, betFile2) {
    return betFile1.gameID === betFile2.gameID &&
      betFile1.oddsType === betFile2.oddsType &&
      betFile1.side === betFile2.side;
  }


  open() {
    this.isOpen = true;
    this.isOpenSubject.next(true);
  }

  close() {
    this.isOpen = false;
    this.isOpenSubject.next(false);
  }


  neWsetBet(_gameID,_ball,_teamInfo,_list,_play){


    const betFile: IBetFile = {
      teamInfo: _teamInfo,
      gameID: _gameID,
      oddsType: 0,
      strong: '',
      head: '',
      odds: 0,
      side: 0,
      play: _play,
      ball: _ball,
      nweBet:_list
    };
    this.singleBetFile=betFile;
    this.open();
    console.log(this.singleBetFile);
  }

}
