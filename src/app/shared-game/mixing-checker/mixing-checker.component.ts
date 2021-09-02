import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef,
  Input, ElementRef, ViewChild
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BetStatusService } from '@app/service/status-bet.service';
import { UnSubscribe } from 'lib/ng-component/unsubscribe';
import { ConfigSetService } from '@app/service/config-set.service';
import { TransBet, TransSide } from 'ts/translate-value';
import { DialogStatusService } from '@app/service/status-dialog.service';
import { ICredit, IBetFile } from '@app/ts/interface';
import { DEFAULT } from '@app/app.config';
import { Play } from '@app/ts/play';
import { BetResCase, IBetSuccessFile } from '@app/ts/bet';
import { isEO, isOU } from '@app/ts/is-true';
import { BallStatusService } from '@service/status-ball.service';
import { BallCreditService } from '@app/bet/ball-credit.service';
import { MemberService } from '@service/store-member.service';
import { BetService } from '@app/bet/bet.service';
import { PlayStatusService } from '@service/status-play.service';

@Component({
  selector: 'game-mixing-checker',
  templateUrl: './mixing-checker.component.html',
  styleUrls: ['./mixing-checker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MixingCheckerComponent extends UnSubscribe implements OnInit {
  @Input() isPlatform: boolean;
  // 顯示為單行模式
  @Input() single: boolean;
  @ViewChild('btnBox') private btn: ElementRef;
  // 過關賠率
  private mixingOdds: number;
  factors = [];
  isCalcActive = false;
  headOptions = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0, -5, -10, -15, -20, -25, -30, -35, -40, -45, -50, -55, -60, -65, -70, -75, -80, -85, -90, -95];
  resultOptions = ['None', 'Win', 'Lose', 'Mfair', 'Mwin', 'Mlose'];
  MixOptions = ['One'];
  setWater = 0;
  mixPlay = 'One';
  setBet = '';
  checkBetActive = false;
  private lang = this.configSet.lang;
  TransBet = TransBet[this.lang];
  // 下注選項語言包
  TransSide = TransSide[this.lang];

  //result
  ordercount = 1;
  totalgold = 0;
  watergold = 0;
  resgold = 0;
  alertinfo = '';
  showresult = false;



  // 球種玩法限額
  credit: ICredit;
  // 是否禁止下注
  isBetting = false;
  // 是否為現金版
  isCashVer = DEFAULT.isCashVer;
  // 最低下注額度
  MIN_BET = DEFAULT.MIN_BET;
  // 是否為中國版
  isCN = DEFAULT.isCN;
  // 金額input格式控制
  goldControl: FormControl = new FormControl({ disabled: this.isBetting }, Validators.pattern('^[0-9]*$'));
  // 會員額度
  private memberSurplus: number = this.betService.memberSurplus;
  // 錯誤訊息
  errMsg: string;
  // 下注金額
  gold = undefined;
  // 可贏金額
  estGold: number;
  // 下注成功資料
  betSuccessFile: IBetSuccessFile;
  // 是否下注成功 下注成功視窗顯示
  betSuccess: boolean = false;


  constructor(
    public betStatus: BetStatusService,
    private cd: ChangeDetectorRef,
    private configSet: ConfigSetService,
    public ballStatus: BallStatusService,
    private dialog: DialogStatusService,
    public member: MemberService,
    private ballCredit: BallCreditService,
    private betService: BetService,
    public playStatus: PlayStatusService,
    ) {
    super();
    this.resetFactor();
    this.ballStatus.ball$.subscribe(ball => this.getCredits());
  }

  ngOnInit() {
    this.changeListener();
    if (this.isPlatform) {
      this.btn.nativeElement.style.bottom = '0';
    }
    this.getCredits();
    this.runGoldControl();

  }
  resert() {
    this.ordercount = 1;
    this.totalgold = 0;
    this.watergold = 0;
    this.resgold = 0;
    this.alertinfo = '';
    this.showresult = false;
    this.setWater = 0;
    this.mixPlay = 'One';
    this.setBet = '';
    this.resetFactor();
  }
  headStringify(number) {
    if (number >= 0) {
      return '+' + number;
    }
    return '' + number;
  }
  resetFactor() {
    this.factors = [];
    for (let i = 0; i < 10; i++) {
      this.factors.push({
        odds: '',
        head: 0,
        result: 'None'
      });
    }
  }
  floor(num) {
    return Math.floor(num);
  }
  openBetDialog() {
    this.betStatus.open();
  }
  checkBet() {
    this.checkBetActive = !this.checkBetActive;
    if (this.checkBetActive) {
      this.setBetFile();
    } else {
      this.betSuccess = false;
      this.betSuccessFile = null;
    }
  }
  calcResult() {
    var bet = Number(this.setBet),
        wat = this.setWater,
        rm = /^\d+$/,
        rw = /^[0-9]+\.?[0-9]*?$/;
    if (!rm.test(bet + '') || Number(bet) == 0) {
        this.alertinfo = '下注金額格式錯誤!請重新輸入';
    } else if (!rw.test(wat.toString())) {
        this.alertinfo = '退水格式錯誤!請重新輸入退水百分比(例:退100請輸入1.退50請輸入0.5)';
    } else {
        var len = this.factors.length,
            tmp = [],
            ordercount = 1,
            totalgold = 0,
            watergold = 0,
            resgold = 0,
            alertinfo = '',
            showresult = false,
            dectectOdd = function(end, head, odds) {
                head = (head == '') ? 0 : (parseInt(head) / 100);
                odds = parseFloat(odds);
                switch (end) {
                    case 'Win':
                        return 1 + odds;
                    case 'Lose':
                        return 0;
                    case 'Mfair':
                        return 1;
                    case 'Mwin':
                        return (1 + (Math.abs(head) * odds)).toFixed(4);
                    case 'Mlose':
                        return (1 - Math.abs(head)).toFixed(4);
                }
            },
            calcMoney = function(_setWater) {
                var ltn = tmp.length;
                if (ltn < 2) {
                    alertinfo = '請依序輸入兩關以上的關卡';
                } else {
                    var odds = 1,
                        wt = false;
                    for (var i = 0; i < ltn; i++) {
                        var t = tmp[i];
                        if (t.result == 'Lose')
                            wt = true;
                        odds = odds * dectectOdd(t.result, t.head, t.odds);
                    }
                    var wat = wt ? (Number((Number(_setWater) / 100).toFixed(2)) * bet) : 0;
                    totalgold = bet * ordercount;
                    resgold = (bet * odds) - bet + wat;
                    watergold = wat
                    showresult = true;
                }
            };
        for (var i = 0; i < len; i++) {
            var t = this.factors[i];
            if (t.odds != '' && t.result != 'None') {
                var rg = /^\d{1}/;
                if (!rg.test(t.odds)) {
                    this.alertinfo = '輸入賠率格式不對';
                    break;
                }
                tmp.push(t);
            } else if ((t.odds == '' && t.result != 'None') || (t.odds != '' && t.result == 'None')) {
                this.alertinfo = '請完整填寫賠率或輸贏';
                break;
            } else if ((t.head != '' && t.result == 'Mfair')) {
                this.alertinfo = '邏輯錯誤!請重新選擇球頭或輸贏';
                break;
            }
        }
        calcMoney(this.setWater);

        this.ordercount = ordercount;
        this.totalgold = totalgold;
        this.watergold = watergold;
        this.resgold = resgold;
        this.alertinfo = alertinfo;
        this.showresult = showresult;
    }
    if (this.alertinfo) {
      alert(this.alertinfo);
      
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
  
  toggleCalc() {
    this.isCalcActive = !this.isCalcActive;
    if (!this.isCalcActive) {
      this.resert();
    }
  }

  // 設置下注內容 (顯示用)
  private setBetFile() {

    this.betStatus.mixingBetFiles =
      this.betStatus.mixingBetFiles.map(betFile => {
        betFile['selectedTitle'] = this.setTitle(betFile);
        return betFile;
      });

    this.mixingOdds = this.betStatus.mixingBetFiles
      .reduce((sumOdds, betFile) => sumOdds * (1 + betFile.odds), 1);


  }
  /**
   * 取得球種限額
   */
  private getCredits() {
    this.ballCredit.getCredits(this.betStatus.singleBetFile)
      .subscribe(credit => {
        this.credit = credit;
        this.cd.markForCheck();
      });
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
  
  private changeListener() {
    this.betStatus.mixingBetEvent$
      .takeUntil(this.unSubscribe).subscribe(() => {
        this.cd.markForCheck();
      });
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
      } else if (gold > this.credit.SO) { //下注金額大於單注限額
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
   * 判斷過關選擇數量是否足夠
   */
  private checkBetFileEnough() {
    if (this.playStatus.play !== Play.mixing) { return; }
    if (this.betStatus.mixingBetFiles.length < 2) {
      this.errMsg = this.TransBet['UnEnoughGame'];
    }
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
   * 進行下注
   */
  bet() {
    if (this.isBetDisabled()) {  // 判斷目前是否可以下注
      if (!this.gold) {
        this.dialog.alert(this.TransBet['ErrorGold']);
      } else {
        this.dialog.alert(this.errMsg);
      }
      return; 
    }
    this.errMsg = this.TransBet['Betting']; //改為下注中
    this.isBetting = true;
    const betFile = this.betStatus.mixingBetFiles;
    this.betService.bet(this.gold, betFile).subscribe(betRes => {
      this.errMsg = '';
      this.isBetting = false;
      switch (betRes.case) {
        case BetResCase.pleaseCheck: //請確認注單 大陸足球走地
          this.betSuccess = true;
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
          this.dialog.alert(betRes.file);
          break;
      }
      this.cd.markForCheck();
    });

  }
  /**
   * 是否能夠下注
   */
  isBetDisabled() {
    if (!this.gold || this.errMsg || this.isBetting) { return true; }
    return false;
  }
  /**
   * 取消下注
   * @param betFile 
   */
  cancel(betFile: IBetFile) {
    this.betStatus.cancelMixingBetFile(betFile);
    this.checkBetFileEnough();
  }

  head_result(_text){
    switch(_text){
      case 'Win': case 'Lose':
        return 100;
      default:
        return 0;
    }
  }

}
