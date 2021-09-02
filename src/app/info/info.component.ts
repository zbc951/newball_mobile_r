// Angular
import { Component, ChangeDetectorRef, OnInit, ChangeDetectionStrategy } from '@angular/core';
// App
import { ApiService } from '@service/api.service';
import { UidStatusService } from '@service/status-uid.service';
// Info
import { IGameResult } from './interface';
import { RouterPath } from '@app/app.config';
// ts
import { Ball, appBalls, IAppBalls } from 'ts/ball';
// lib
import { formatDayToDate, DayCase } from 'lib/helper/date';
// RxJS
import { Observable } from 'rxjs/Observable';
import { ConfigSetService } from '@app/service/config-set.service';
import { BallStatusService } from '@app/service/status-ball.service';



@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoComponent implements OnInit {
  // 路由資料
  RouterPath = RouterPath;
  //會員uid
  private uid = this.uidStatus.uid;
  //目前語言
  private lang = this.configSet.lang;
  //球種陣列
  appBalls: IAppBalls[] = appBalls;
  //賽事結果資料
  //   gameResult$: Observable<IGameResult[]>;
  //目前套用日期
  useDay;
  //是否再隊伍名稱面前顯示 主客
  showSide:boolean = true;
  // 目前套用球種
  useBall: Ball = this.statusBall.ball ||Ball.BK;
  //目前套用的日期按鈕
  selectedOption = '';
  //賽事結果資料
  resultList = [];
  //日期選項
  dateOptions = [];
  //沒有主客的球種
  noHCary = ['GD', 'ST', 'LO'];  
  //球種選擇dialog顯示
  chooseBallActive:boolean = false;
  //日期選擇dialog顯示
  chooseDateActive:boolean = false;

  constructor(
    private apiService: ApiService,
    private uidStatus: UidStatusService,
    private statusBall: BallStatusService,
    private configSet: ConfigSetService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // this.switchDay(this.useDay);
    for (let i = -10; i < 0; i++) {
        this.dateOptions.push({
            short: moment().add(i, 'days').format('MM/DD'),
            whole: moment().add(i, 'days').format('YYYY-MM-DD')
        });
    }
    this.useDay = this.dateOptions[9];
    this.showSide = this.hasHC();
    this.chooseOption('Today');
    // console.log(this.appBalls);
    // console.log(this.showSide);
    // console.log(this.statusBall);
  }
  /**
   * 回傳目前球種是否有主客隊
   */
  hasHC() {
    for (let i = 0; i < this.noHCary.length; i++) {
        if (this.useBall === this.noHCary[i]) {
            return false;
        }
    }
    return true;
  }
  /**
   * 回傳是否為數字
   * @param s 
   */
  isNumber(s) {
    return !isNaN(s);
  }
  /**
   * 是否顯示該場賽事
   * @param game 
   */
  showGame(game) {
      if (this.showSide) {
        return game.ht && game.ct && game.ht.length > 0 && game.ct.length > 0;
      } else {
        return game.ht && game.ht.length > 0;
      }
  }
  /**
   * 切換球種
   * @param ball 
   */
  switchBall(ball: Ball) {
    this.chooseBallActive = false;
    this.useBall = ball;
    this.showSide = this.hasHC();
    this.getGameResult(this.useBall, this.useDay.whole);
  }
  /**
   * 切換日期(昨日[含]以前)
   * @param day 
   */
  switchDay(day) {
    this.useDay = day;
    this.chooseDateActive = false;
    this.selectedOption = 'Other';
    this.getGameResult(this.useBall, this.useDay.whole);
  }
  /**
   * 選擇日期
   * @param dateType 
   */
  chooseOption(dateType) {
    if (dateType == this.selectedOption) return;
    this.chooseDateActive = false;
    this.chooseBallActive = false;
    this.selectedOption = dateType;
    if (dateType == 'Today') {
        this.useDay = {
            short: moment().format('MM/DD'),
            whole: moment().format('YYYY-MM-DD')
        };
        this.getGameResult(this.useBall, this.useDay.whole);
    } else if (dateType == 'Tomorrow') {
        this.useDay = {
            short: moment().add(1, 'days').format('MM/DD'),
            whole: moment().add(1, 'days').format('YYYY-MM-DD')
        };
        this.getGameResult(this.useBall, this.useDay.whole);
    }
  }
  /**
   * 開啟/關閉球種選擇視窗
   */
  toggleChooseBall() {
      this.chooseBallActive = !this.chooseBallActive;
      this.chooseDateActive = false;
  }
  /**
   * 開啟/關閉日期選擇視窗
   */
  toggleChooseDate() {
    this.chooseBallActive = false;
    this.chooseDateActive = !this.chooseDateActive;
  }
  /**
   * 取得賽事結果
   * @param ball 球種
   * @param date 日期
   */
  private getGameResult(ball: Ball, date: string) {

    this.useBall = ball;

    const req = { uid: this.uid, lang: this.lang, date: date, gtype: ball };
    this.apiService.postServer(213, req).subscribe(res => {
      this.resultList = convertResult(collectResult(res.ret));
        this.cd.markForCheck();
    });
    // this.gameResult$ = this.apiService.postServer(213, req).map(res => res.ret);
  }

}


//collectResult(陣列)函數:整理比賽結果
let collectResult = function(arr) {
  var len = arr.length, //陣列長度
      res = [];
  if (len > 0) { //如果長度>0
      for (var i = 0; i < len; i++) { //for循環整個陣列
          var t = arr[i]; //預先定義陣列該值
          if (t.ms == '') { //如果t的ms值為空字串(代表為基本的賽事結果)
              //res裡加入對應的資訊
              res.push({
                  'id': t.id,
                  'lid': t.league_id,
                  'date': moment(t.date_1).format('MM-DD'),
                  'time': t.time_1,
                  'ht': t.team_id_h,
                  'ct': t.team_id_c,
                  'rh': t.result_h == '-1' ? 'X' : t.result_h,
                  'rc': t.result_c == '-1' ? 'X' : t.result_c,
                  'memo': t.gamememo
              });
          }
      }
      for (var i = 0; i < len; i++) { //for循環整個陣列
        var t = arr[i]; //預先定義陣列該值
        if (t.ms != '') { //如果ms裡面有值
            var sub = t.ms.split('_'), //切割ms值中的'_'
                nid = sub[0], //切割後的前段(賽事編號)
                nn = sub[1], //切割後的後段(上(1)下半(2))
                lth = res.length; //res的長度
            for (var j = 0; j < lth; j++) { //for循環整個res
                if (res[j].id == nid) { //如果res[i]裡id值與nid相同
                    switch (nn) { //判斷nn值
                        case '1': //如果為1
                            res[j].rh1 = t.result_h; //將t的result_h加至res[j].rh1
                            res[j].rc1 = t.result_c; //將t的result_c加至res[j].rc1
                            break;
                        case '2': //如果為2
                            res[j].rh2 = t.result_h; //將t的result_h加至res[j].rh2
                            res[j].rc2 = t.result_c; //將t的result_c加至res[j].rc2
                            break;
                    }
                    break;
                }
            }
        }
    }
      return res;
  } else {
      return [];
  }
};

let convertResult = function(dl) {
  if (!dl) {
      return dl;
  } else {
      var dlarr = [];
      var arral = [];
      for (var key in dl) {
          arral.push(dl[key].lid);
      }
      var result = arral.filter(function(element, index, arr) {
          return arr.indexOf(element) === index;
      });
      for (var key in result) {
          dlarr.push({ 'alliance': result[key], 'data': [] });

      }
      for (var key in dl) {
          for (var keys in dlarr) {
              if (dlarr[keys].alliance == dl[key].lid) {
                  dlarr[keys].data.push(dl[key]);
              }
          }
      }

  }
  return dlarr;
};
