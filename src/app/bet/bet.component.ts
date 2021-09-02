// Angular
import {
  Component, ChangeDetectionStrategy, Input, Output, EventEmitter,
  OnInit, OnChanges, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
// App
import { Play } from '@app/ts/play';
import { Ball } from '@app/ts/ball';
import { BetResCase, IBetSuccessFile } from '@app/ts/bet';
import { Odds, IOddsType } from '@app/ts/odds';
import { ICredit, IBetFile } from '@app/ts/interface';
import { isEO, isOU } from '@app/ts/is-true';
import { GamesService } from '@app/lobby/games/games.service';
import { MemberService } from '@service/store-member.service';
// Service
import { UidStatusService } from '@service/status-uid.service';
import { BallStatusService } from '@service/status-ball.service';
import { PlayStatusService } from '@service/status-play.service';
import { ApiService } from '@service/api.service';
import { SpecialPlayService } from '../lobby/special-play.service';
// Bet
import { BetService } from './bet.service';
import { BallCreditService } from './ball-credit.service';
// RxJS
import 'rxjs/add/operator/takeUntil';
// lib
import { isArray } from 'lib/helper/is-empty';
import { UnSubscribe } from 'lib/ng-component/unsubscribe';
import { BetStatusService } from '@app/service/status-bet.service';
import { DEFAULT } from '@app/app.config';
import { transformFn } from '@shared-game/head-name.pipe';
import { ConfigSetService } from '@app/service/config-set.service';
import { DialogStatusService } from '@app/service/status-dialog.service';

import { TransBet, TransSide } from 'ts/translate-value';

@Component({
  selector: 'app-bet',
  templateUrl: './bet.component.html',
  styleUrls: ['./bet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BetComponent extends UnSubscribe {
  @Output() close: EventEmitter<void> = new EventEmitter();
  // 會員額度
  private memberSurplus: number = this.betService.memberSurplus;
  // 過關賠率
  private mixingOdds: number;
  // 目前語系
  private lang = this.configSet.lang;
  // 最低下注額度
  MIN_BET = DEFAULT.MIN_BET;
  // 是否為中國版
  isCN = DEFAULT.isCN;
  // 是否為現金版
  isCashVer = DEFAULT.isCashVer;
  // 玩法設定
  Play = Play;
  // 下注按鈕無效
  isInputDisabled: boolean = false;
  // 金額input格式控制
  goldControl: FormControl = new FormControl({ disabled: this.isInputDisabled }, Validators.pattern('^[0-9]*$'));
  // 下注金額
  gold: number;
  // 可贏金額
  estGold: number;
  // 球種限額
  credit: ICredit;
  // 下注金額錯誤訊息
  errMsg: string;
  // 下注成功資料
  betSuccessFile: IBetSuccessFile;
  // 下注訊息語言包
  TransBet = TransBet[this.lang];
  // 下注選項語言包
  TransSide = TransSide[this.lang];
  // 是否下注成功 下注成功視窗顯示
  betSuccess: boolean = false;
  // 下注過關顯示 是否展開各比細節
  detailOpen: boolean = false;
  //下注資訊是否完整
  detailSafe: boolean = true;

  autocheck:Boolean = false;

  restatus :any;

  newBerMode:Boolean = false;
  retdate:any=[];
  constructor(
    public betStatus: BetStatusService,
    private betService: BetService,
    private ballCredit: BallCreditService,
    public playStatus: PlayStatusService,
    public ballStatus: BallStatusService,
    private configSet: ConfigSetService,
    private member: MemberService,
    private games: GamesService,
    private cd: ChangeDetectorRef,
    private dialog: DialogStatusService,
    private api: ApiService,
    private uidStatus: UidStatusService,
    public SpecialPlay :SpecialPlayService,
    ) {
    super();
    super.ngOnDestroy();
  }

  ngOnInit() {
    console.log(this.betStatus.singleBetFile);
    if(this.betStatus.singleBetFile.nweBet == null){
      this.setBetFile();
      this.getCredits();
      this.runGoldControl();
    }else{
      this.newBerMode =true;
      this.newrunGoldControl();
    }

  }
  // 設置下注內容 (顯示用)
  private setBetFile() {
    if (this.playStatus.play === Play.mixing) {

      this.betStatus.mixingBetFiles =
        this.betStatus.mixingBetFiles.map(betFile => {
          betFile['selectedTitle'] = this.setTitle(betFile);
          return betFile;
        });

      this.mixingOdds = this.betStatus.mixingBetFiles
        .reduce((sumOdds, betFile) => sumOdds * (1 + betFile.odds), 1);

    } else {
      this.betStatus.singleBetFile['selectedTitle'] =
        this.setTitle(this.betStatus.singleBetFile);
    }
  }
  /**
   * 取得選擇的選項名稱
   * @param betFile 
   */
  private setTitle(betFile: IBetFile) {

    const name_H = betFile.teamInfo.name_H;
    const name_C = betFile.teamInfo.name_C;
    const oddsType = betFile.oddsType;
    const side = betFile.side;
    const  head = betFile.head;
    let sideName: string;
    let selectedTitle: string;
    if (betFile.oddsType === 'PD') {
    } else if (isOU(oddsType)) {
      sideName = side === 'H' ? this.TransSide['BIG'] : this.TransSide['SMALL'];
      // selectedTitle = transformFn(head, this.ballStatus.ball, this.configSet.lang) + ' ' + sideName;
      selectedTitle = sideName;
    } else if (isEO(oddsType)) {
      sideName = side === 'ODD' ? this.TransSide['ODD'] : this.TransSide['EVEN'];
      selectedTitle = sideName;
    } else {
      const team = side === 'H' ? name_H : name_C;
      sideName = side === 'H' ? `[${this.TransSide['H']}]` : `[${this.TransSide['C']}]`;
      selectedTitle = sideName + team;
      if (side === 'N') {
        selectedTitle = `${this.TransSide['N']}`;
      }
    }

    return selectedTitle;
  }
  /**
   * 取得球種限額
   */
  private getCredits() {
    this.ballCredit.getCredits(this.betStatus.singleBetFile)
      .subscribe(credit => {
        this.credit = credit;
        // console.log(this.credit,this.betStatus.singleBetFile);
        this.cd.markForCheck();
      });
  }
  /**
   * 是否顯示球頭
   * @param oddType 玩法
   */
  showHead(oddType) {
    return ['R', 'R_1', 'R_2', '2R','OU','OU_1','OU_2','2R'].indexOf(oddType) >= 0;
  }
  /**
   * 監聽下注金額輸入
   */
  private runGoldControl() {
    const goldInput = this.goldControl.valueChanges.takeUntil(this.unSubscribe);
    goldInput.subscribe(gold => {
      if (this.member.memberInfo.maxcredit) {
        this.memberSurplus = this.member.memberInfo.maxcredit;
      }
      this.errMsg = '';
      if (gold < this.MIN_BET) { //下注金額小於最低下注金額
        this.errMsg = `${this.TransBet['MinBet']} $${this.MIN_BET}`;
      } else if (gold > this.credit[((this.betStatus.singleBetFile.play == 'RE')?'RE':'')+'SO']) { //下注金額大於單注限額 多RESC-RESO 用來檢查走第
        this.errMsg = this.TransBet['OverGameGold'];
      } else if (this.goldControl.errors) { //下注金額非數字
        this.errMsg = this.TransBet['ErrorGold'];
      } else if (this.isCashVer && gold > this.memberSurplus) { //下注金額大於信用額度/剩餘額度
        this.errMsg = this.TransBet['OverCreditGold'];
      }
      this.checkBetFileEnough();
      this.estGold = this.calEstGold(gold);
    });
  }
  /**
   * 計算可贏金額
   * @param gold 
   */
  private calEstGold(gold: number): number {
    if (this.playStatus.play !== Play.mixing) {
      return Math.floor(gold * this.betStatus.singleBetFile.odds);
    }
    return Math.round(this.mixingOdds * gold - gold);
  }
  /**
   * 判斷過關選擇數量是否足夠
   */
  private checkBetFileEnough() {
    if (this.playStatus.play !== Play.mixing) { return; }
    if (this.betStatus.mixingBetFiles.length < 2) {
      this.errMsg = this.TransBet['UnEnoughGame'];
    }
  }
  /**
   * 壘加下注金額
   * @param add 
   */
  addGold(add: number) {
    if (typeof this.gold === 'undefined') { this.gold = 0; }
    this.gold += add;
  }
  /**
   * 進行下注
   */
  bet() {
    if (this.isBetDisabled() || this.isInputDisabled) {  // 判斷目前是否可以下注
      if (!this.gold) {
        this.dialog.alert(this.TransBet['ErrorGold']);
      } else {
        this.dialog.alert(this.errMsg);
      }
      return; 
    }
    this.errMsg = this.TransBet['Betting']; //改為下注中
    this.isInputDisabled = true;
    const betFile = this.betStatus.singleBetFile || this.betStatus.mixingBetFiles;
    this.betService.bet(this.gold, betFile,this.autocheck).subscribe(betRes => {
      this.errMsg = '';
      this.isInputDisabled = false;
      this.detailSafe = true;
      switch (betRes.case) {
        case BetResCase.pleaseCheck: //請確認注單 大陸足球走地
          this.betSuccess = true;
          this.dialog.alert(this.TransBet['Success']);
          this.closePage();
          break;
        case BetResCase.success: //下注成功
          this.betSuccessFile = betRes.file;
          this.betSuccess = true;
          this.betStatus.cancelAllMixingBetFile();
          break;
        case BetResCase.updateOdds: //更新賠率
          this.betStatus.singleBetFile.odds = betRes.file;
          this.dialog.alert(this.TransBet['OddChange']);
          break;
        case BetResCase.updateHead: //更新球頭
          this.betStatus.singleBetFile.head = betRes.file;
          this.dialog.alert(this.TransBet['HeadChange']);
          break;
        case BetResCase.noOid: //未有產生注單資訊
        this.dialog.alert(this.TransBet['noOid']);
          break;
        case BetResCase.totalError: //不屬於下注錯誤的其他錯誤
          break;
        default:
          this.betStatus.close();
          this.dialog.alert(betRes.file);
          break;
      }
      this.cd.markForCheck();
    });

  }

  /**
   * 判斷是否為數字
   * @param n 
   */
  isNumber(n) {
    if (n === null) return false;
    return !isNaN(n);
  }
  /**
   * 取消下注
   * @param betFile 
   */
  cancel(betFile: IBetFile) {
    this.betStatus.cancelMixingBetFile(betFile);
    this.checkBetFileEnough();
  }


  /**
   * 是否能夠下注
   */
  isBetDisabled() {
    if (!!!this.gold || !!this.errMsg) { return true; }
    return false;
  }
  /**
   * 關閉下注頁面
   */
  closePage() {
    this.betStatus.close();
  }

 /**
   * 進行下注
   */
  newbBet() {
    if (this.isBetDisabled() || this.isInputDisabled) {  // 判斷目前是否可以下注
      if (!this.gold) {
        this.dialog.alert(this.TransBet['ErrorGold']);
      } else {
        this.dialog.alert(this.errMsg);
      }
      return; 
    }
    this.errMsg = this.TransBet['Betting']; //改為下注中
    this.isInputDisabled = true;
    const request = {
      uid:this.uidStatus.uid,
      gtype:this.betStatus.singleBetFile.ball,
      gid:this.betStatus.singleBetFile.gameID,
      gold:this.gold,
      concede:this.betStatus.singleBetFile.nweBet.concede,
      ioratio:this.betStatus.singleBetFile.nweBet.ioratio,
      type:this.betStatus.singleBetFile.nweBet.type,
      maid:this.betStatus.singleBetFile.nweBet.maid,
      gaid:this.betStatus.singleBetFile.nweBet.gaid,
      odid:this.betStatus.singleBetFile.nweBet.odid,
      option:this.betStatus.singleBetFile.nweBet.option,
      source_id:this.betStatus.singleBetFile.nweBet.source_id,
      lang: this.lang
    };
    console.log(request);
    this.api.postServer(350, request).map(apiRes => apiRes.ret)
    .subscribe(betRes => {
      console.log(betRes);
      this.errMsg = '';
      this.isInputDisabled = false;
      this.detailSafe = true;
      if(betRes.length == 0){
        this.closePage();
        this.SpecialPlay.nowUPdata();
      }else if(betRes[0] === 'order success'){
        this.retdate = betRes;        
        this.betSuccess = true;
        this.member.updateMemberInfo();
       // this.closePage();
      }
      this.cd.markForCheck();
    });



  }


  /**
   * 監聽下注金額輸入
   */
  private newrunGoldControl() {
    const goldInput = this.goldControl.valueChanges.takeUntil(this.unSubscribe);
    goldInput.subscribe(gold => {
      if (this.member.memberInfo.maxcredit) {
        this.memberSurplus = this.member.memberInfo.maxcredit;
      }
      this.errMsg = '';
      if (gold < this.MIN_BET) { //下注金額小於最低下注金額
        this.errMsg = `${this.TransBet['MinBet']} $${this.MIN_BET}`;
      }  else if (this.goldControl.errors) { //下注金額非數字
        this.errMsg = this.TransBet['ErrorGold'];
      } else if (this.isCashVer && gold > this.memberSurplus) { //下注金額大於信用額度/剩餘額度
        this.errMsg = this.TransBet['OverCreditGold'];
      }
      this.estGold = this.nwwCalEstGold(gold);
    });
  }
    /**
   * 計算可贏金額
   * 浮點樹相乘，控制第幾位 在piple formatNumber
   * @param gold 
   */
  private nwwCalEstGold(gold: number): number {

    var arg1 = gold;
    var arg2 = this.betStatus.singleBetFile.nweBet.ioratio;
    if(typeof (arg1) != 'number' || typeof (arg2)  != 'number'){
      return 0;
    }
    var m=0,s1=arg1.toString(),s2=arg2.toString(); 
    try {
        m+=s1.split(".")[1].length;
    } catch(e){} 
    try {
        m+=s2.split(".")[1].length;
    } catch(e){} 
    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m);

    //  return Math.floor(gold * this.betStatus.singleBetFile.nweBet.ioratio);

  }


}
