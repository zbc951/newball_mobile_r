// Angular
import {
  Component, OnInit, OnChanges, Input,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
// App
import { Play } from '@app/ts/play';
import { IBetFile } from '@app/ts/interface';
import { PlayStatusService } from '@service/status-play.service';
import { BallStatusService } from '@service/status-ball.service';
import { BetStatusService } from '@service/status-bet.service';
import { isFT, isOU } from '@app/ts/is-true';
import { StatusPlatformService, IPlatformTeam } from '@service/status-platform.service';
// lib
import { UnSubscribe } from 'lib/ng-component/unsubscribe';
import { Ball } from '@app/ts/ball';
import { DEFAULT } from '@app/app.config';

import { ConfigSetService } from '@app/service/config-set.service';
@Component({
  selector: 'game-table',
  templateUrl: './game-table.component.html',
  styleUrls: ['./game-table.component.scss'],  
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameTableComponent extends UnSubscribe implements OnChanges {
  //該賽事球種
  @Input() useBall: Ball;
  //該賽事資料
  @Input() game: any;
  //第一層顯示玩法
  @Input() titleAry: Array<string>;
  //詳細顯示玩法
  @Input() detailAry: Array<Array<string>>;
  //顯示賽事詳細資訊
  @Input() detailCallback: Function;
//新手版-專業版
  @Input()beginner:Boolean;
  // 玩法種類
  @Input()type:String;
  /**是否為聯盟模式  預設 是 */
  @Input()orderLeague:Boolean;
  //是否展開
  isExpand = false;
  //玩法
  Play = Play;
  //波膽是否展開
  pdExpand = true;
  //是否有啟用波膽玩法
  is_PD_open = DEFAULT.hasPD;
  //轉換過格式的賽事玩法資料 第一層(外面層)
  titleDataList: Array<any>;
  //轉換過格式的賽事玩法資料 詳細層
  moreDataList: Array<any>;

  HKod = true;
  constructor(
    private betStatus: BetStatusService,
    public statusPlatform: StatusPlatformService,
    private playStatus: PlayStatusService,
    private cd: ChangeDetectorRef,
    private configSet: ConfigSetService,
  ) {
    super();
  }

  ngOnInit() {
    this.changeListener();
    this.updateOddsTable();
    this.updateMoreDetail();
    this.configSet.HKodd$.subscribe((res) => {
      this.HKod = res
      this.cd.markForCheck();
      });
     //console.log(this.game);
  }
  ngOnChanges() {
    this.updateOddsTable();  // game odd
    this.updateMoreDetail();// moreDataList 單雙
    this.cd.markForCheck();
  }
  /**
   * 設定下注內容
   * @param teamInfo 賽事隊伍資料 
   * @param handicap 賠率資料
   * @param play 投注玩法
   */
  setBet( handicap, play) {
    console.log(this.moreDataList);
    if (!handicap.odd) return;
    //this.betStatus.setBet(this.game.teamInfo, handicap, play);
  }
 
  /**
   * 
   * @param play 玩法
   * @param HC 隊伍
   */
  setBetAll( play, HC) {
    console.log(this.type);
    if (this.game.handicaps.length == 0) return;
        let data = {};
        this.game.handicaps.forEach(element => {
          if(element.type == play){
            data['head']= element.head;
            data['odd']= element['odds_' +HC];
            data['side']= element['side_' +HC];
            data['strong']= element.strong;
          }
        });
        if (!data['odd']) return;
        this.betStatus.setBet(this.game.teamInfo,data, play,this.type,this.useBall);
  }
  /**
   * 設定波膽下注內容
   * @param teamInfo 賽事隊伍資料
   * @param point 
   */
  setBetPD(teamInfo, point) {
    this.betStatus.setBet(teamInfo, {
      odd: point.rioratio,
      side: point.type,
      head: point.type
    }, 'PD');
  }
  /**
   * 轉換時間格式
   * @param date 
   */
  getShortDate(date) {
    let tmp = date.split('-');
    tmp.shift(1);
    return tmp.join('/');
  }
  /**
   * 更新賠率
   */
  updateOddsTable() {
    let res = this.changeFormat(this.titleAry, this.game.handicaps, this.game. location);
    this.titleDataList = res.retData;
    if (this.isExpand) {
      this.updateMoreDetail();
    }

  }
  /**
   * 更新更多玩法的賠率
   */
  private updateMoreDetail() {
   // console.log(this.detailAry);
    this.moreDataList = [];
    let mapping = ['F', 'U', 'D'];
    for (let i = 0; i < this.detailAry.length; i++) {
      let res2 = this.changeFormat(this.detailAry[i], this.game.handicaps, this.game. location);
      if (res2.hasData) {
        this.moreDataList.push({
          part: mapping[i],
          data: res2.retData,
          titles: this.detailAry[i],
          active: true
        });
      }
    }
  }
  /**
   * 轉換賠率為符合layout的格式
   * @param format 玩法陣列 EX: ['OU', 'R', 'M']
   * @param handicapsData 原賠率資料
  * @param location 主.客.中立場次
   */
  private changeFormat(format, handicapsData,location) {
    let hasData = false;
    let tempAry:Array<any> = [{side: 'H',location:location}, {side: 'C'}];
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
        if (format[i] == 'M' && oddData['odds_N']) {
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
          tempAry.push(tmpObj);
        }
      }
    }

    return {
      hasData: hasData,
      retData: tempAry
    }
  }

  /**
   * 展開更多玩法
   */
  expand(){
    if (this.isExpand) {
      this.isExpand = false;
    } else {
      this.updateMoreDetail();
      this.isExpand = true;
    }
  }
  /**
   * 取得波膽陣列
   */
  getBetPDAry() {
    let maxPoint = 4;
    let retAry = [[], [], []];
    for (let h = 0; h <= maxPoint; h++) {
      for(let c = 0; c <= maxPoint; c++) {
        let pushIndex = 0;
        if (h > c) { pushIndex = 0 }
        else if(h < c) { pushIndex = 2 }
        else { pushIndex = 1 }
        retAry[pushIndex].push({
          point: `${h}:${c}`,
          rioratio: (this.game && this.game.PD[`H${h}C${c}`]) ? this.game.PD[`H${h}C${c}`].ioratio : 0,
          type: `H${h}C${c}`,
          h:h,
          c:c
        })
      }
    }
    retAry[2].sort((b,a) => (b.c*10+b.h) - (a.c*10+a.h));
    let rAry = [];
    for (let i = 0; i < retAry[0].length; i++) {
      if (retAry[1][i]){
        rAry.push([retAry[0][i], retAry[1][i], retAry[2][i]])
      } else {
        rAry.push([retAry[0][i], {}, retAry[2][i]])
      }
    }

    return rAry;
  }
  /**
   * 是否有波膽
   * @param game 
   */
  PD_open(game) {
    return this.is_PD_open && game.PD && this.playStatus.play === Play.single;
  }
  /**
   * 是否為走地
   */
  isGrounder() {
    return this.playStatus.play === Play.grounder
  }
  /**
   * 過關時被選到的玩法會顯示反紅 回傳該玩法是否被選中
   * @param gameID 
   * @param oddsType 
   * @param side 
   */
  isActive( oddsType, side) {
    const idx = this.betStatus.mixingBetFiles.findIndex(betFile =>
      betFile.gameID === this.game.gameID && betFile.oddsType === oddsType && betFile.side === side
    )
    return idx !== -1;
  }
  private changeListener() {
    this.betStatus.mixingBetEvent$
      .takeUntil(this.unSubscribe).subscribe(() => {
        this.cd.markForCheck()
      });
  }

  /**
   * 是否有中立場
   * @param _gtype 球
   */
  isWinOrLose(_gtype){
    if(['FT'].indexOf(_gtype) >= 0){
      return false;
    }
    return true;
  }
  showGameDetail() {
    this.detailCallback(this.game, this.type, this.useBall);
  }
  isPage(_gtype){
    if(['ST','LO','GD'].indexOf(_gtype) >= 0){
      return false;
    }
    return true;
  }
  toStrong( play, HC){
    let Strong = false;
    this.game.handicaps.forEach(element => {
      if(element.type == play){
     
        if(HC == element.strong){
          Strong = true;
        }
      }
    });
    return Strong;
  }
}
