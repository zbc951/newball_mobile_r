// Angular
import { Component, OnInit, ChangeDetectionStrategy ,ChangeDetectorRef} from '@angular/core';
// App
import { UidStatusService } from '@service/status-uid.service';
import { ApiService } from '@service/api.service';
import { OrderRemindService } from '@service/status-orders.service';
import { HistoryService } from './history.service';
import { ActivatedRoute } from "@angular/router";

// RxJS
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/scan';

import { RouterPath } from '@app/app.config';
import { reduceCalSum } from 'lib/helper/reduce';
import { ConfigSetService } from '@app/service/config-set.service';
import { OrdersCountService } from '@app/report/orders-count.service';
import { FindValueSubscriber } from 'rxjs/operators/find';
// import { tmpdir } from 'os';

interface Order {
  id: string;
  adddate: string;
  tworderdate: string;
  gtype_c: string;
  wtype_c: string;
  gold: string;
  result: string;
}

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ReportComponent implements OnInit {
  // 即時注單資料
  orders: Order[];
  // 即時注單投注金額
  totGold: number;
  // 即時注單可贏金額
  totWin: number;
  // 歷史注單投注金額
  historyTotalGold: number;
  // 歷史注單結果
  historyTotalResult: number;
  historyShowWin: number;
  // 即時注單/歷史注單 切換index
  tabSelected = 0;
  // 目前展開的即時注單內容
  orderSelected = -1;
  // 歷史注單 目前選擇的時間區段
  optionSelected = 0;
  // 目前展開的歷史注單日期資料
  historySelected = -1;
  // 路由資料
  RouterPath = RouterPath;
  // 是否顯示選項
  ShowTab = false;
  // 歷史注單時間區段選項
  historyOptions = ['Today', 'Yesterday','Tomorrow', 'ThisWeek', 'LastWeek', 'ThisMonth'];
  // 歷史注單內容
  historyList = [];
  constructor(
    private api: ApiService,
    private uidStatus: UidStatusService,
    private configSet: ConfigSetService,
    private orderRemind: OrderRemindService,
    private orderCount: OrdersCountService,
    private cd: ChangeDetectorRef,
    private history: HistoryService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getOrders();
    this.orderRemind.clear();
    this.switchDisplay(this.historyOptions[this.optionSelected]);
    // this.route.queryParams.subscribe((queryParams) => {
    //   console.log(queryParams);
    //   console.log(this.route.snapshot.queryParams);
    // });
    if (this.route.snapshot.queryParams['history']) {
      this.tabSelected = 1;
    }
  }
  /**
   * 切換即時注單/歷史注單
   * @param index
   */
  selectTab(index) {
    this.ShowTab = false;
    if (this.tabSelected == index) return;
    this.tabSelected = index;
    if (index === 0) {
      this.getOrders();
    } else {
      this.switchDisplay(this.historyOptions[this.optionSelected]);
    }
  }
  /**
   * 選擇歷史注單時間區段
   * @param index
   */
  selectOption(index) {
    this.optionSelected = index;
    this.switchDisplay(this.historyOptions[index]);
  }
  /**
   * 選擇即時注單要展開的單index
   * @param index
   */
  selectOrder(index) {
    if (index == this.orderSelected) {
      this.orderSelected = -1;
    } else {
      this.orderSelected = index;
    }
  }
  /**
   * 選擇即時注單要展開的日期index
   * @param index
   */
  selectHistory(index) {
    if (index == this.historySelected) {
      this.historySelected = -1;
    } else {
      this.getHistory(index);
    }
  }
  /**
   * 取得歷史注單資料內該index日期的詳細內容
   * @param index
   */
  getHistory(index) {
    let day = this.historyList[index];
    if (day.detailOk || day.wc == 0) {
      this.historySelected = index;
    } else {
      this.history.getBetHistoryDetail(day.date)
      .subscribe(res => {
        day.details = res.map(order => this.analysisOrder(order, true));
        day.detailOk = true;
        this.historySelected = index;
        this.cd.markForCheck();
        //console.log(day.details);
      });
    }
  }
  /**
   * 取得即時注單內容
   */
  private getOrders() {
    const req = { uid: this.uidStatus.uid, lang: this.configSet.lang };
    this.api.postServer(105, req)
      .map(res => res.ret)
      .do(orders => this.orderCount.updateCount(orders.length))
      .subscribe(orders => {
        this.orders = orders.map(order => this.analysisOrder(order))
        this.totGold = Number(orders.reduce(reduceCalSum('gold'), 0).toFixed(2));
        this.totWin = Number(orders.reduce(reduceCalSum('wouldWin'), 0).toFixed(2));
        //console.log(this.orders);
        this.cd.markForCheck();
      });
  }
  /**
   * 回傳該注單的狀態
   * @param order
   */
  getResult(order, isTitle = false) {
    var w,d;
    w = order.wingold;
    d = order.wgold_dm;
    var win = (Number(w) + Number(d)).toFixed(2);
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
          if (isTitle) {
            return 'Report.HasResult';
          } else {
            return win; //html更換為可贏+退水
          }
    }
  }
    /**
   * 回傳該注單的狀態
   * @param detail
   */



  getResults(detail, isTitle = false) {
    switch (detail.result) {
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
        if (isTitle) {
          return 'Report.HasResult';
        } else {
          return (Number(detail.wingold) + Number(detail.wgold_dm)).toFixed(2)  + ''; //html更換為可贏+退水
        }
    }
  }
  /**
   * 分析注單內容
   * @param order
   * @param isHistory
   */
  private analysisOrder(order, isHistory = false) { //isHistory = 107拿到的 下注時間要特別處理
    switch(order.wtype) {
      case 'CPR':
        let tmpOdd = 1;
        let betAry = order.sub.map(minOrder => {
          let bet = order.orderContArr[minOrder.gid];
          let subWtype = minOrder.wtype;
          tmpOdd = Number((tmpOdd * (1 + Number(bet[7]))));
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
        if (isHistory) {
          if (order.adddate_real) {
            order.betTime = moment(order.adddate_real).format('MM/DD HH:mm');
          } else {
            order.betTime = moment(order.adddate).add(12, 'hours').format('MM/DD HH:mm');
          }
        } else {
          order.betTime = moment(order.adddate).format('MM/DD HH:mm');
        }
        // 09/21 更新小數點算法 & 可營金額算法
        order.wouldWin = Math.floor(Number((Number(order.gold) * Number(order.odd)))*100)/100;
        order.odd =Math.floor(order.odd *100)/100;
        break;
      default:
        order.gameName =  (order.orderCont[12] == 2)?order.orderCont[7]:order.orderCont[0];
        order.partInfo = order.orderCont[1];
        order.bid = order.orderCont[2];
        order.team1 =  (order.orderCont[12] == 2)?order.orderCont[8]:order.orderCont[3];
        order.head = (order.orderCont[4] && order.orderCont[4].length > 0)? order.orderCont[4] : 'Vs.';
        order.team2 = (order.orderCont[12] == 2)?order.orderCont[9]:order.orderCont[5];
        order.betOption = (order.orderCont[12] == 2)?order.orderCont[11] : order.orderCont[6];
        order.odd = (order.orderCont[12] == 2)?order.ioratio :order.orderCont[7];
        order.team1Score = order.orderCont[9];
        order.team2Score = order.orderCont[10];
        order.sp=order.orderCont[12];
        order.gameTime = moment(order.gdata.game_time).format('MM/DD HH:mm');
        if (isHistory) {
          if (order.adddate_real) {
            order.betTime = moment(order.adddate_real).format('MM/DD HH:mm');
          } else {
            order.betTime = moment(order.adddate).add(12, 'hours').format('MM/DD HH:mm');
          }
        } else {
          order.betTime = moment(order.adddate).format('MM/DD HH:mm');
        }
        order.wouldWin = Number((Number(order.gold) * Number(order.odd)).toFixed(2));
    }
   // console.log(order);
    return order;
  }
  /**
   * 切換歷史注單日期區段
   * @param type
   */
  switchDisplay(type) {
    let start, end;
    switch(type) {
      case 'Today':
        start = moment().format('YYYY-MM-DD');
        end = moment().format('YYYY-MM-DD');
        break;
      case 'Yesterday':
        start = moment().add(-1, 'days').format('YYYY-MM-DD');
        end = moment().add(-1, 'days').format('YYYY-MM-DD');
        break;
      case 'Tomorrow':
        start = moment().add(1, 'days').format('YYYY-MM-DD');
        end = moment().add(1, 'days').format('YYYY-MM-DD');
        break;
      case 'ThisWeek':
        start = moment().startOf('isoWeek').format('YYYY-MM-DD');
        end = moment().endOf('isoWeek').format('YYYY-MM-DD');
        break;
      case 'LastWeek':
        start = moment().add(-1, 'weeks').startOf('isoWeek').format('YYYY-MM-DD')
        end = moment().add(-1, 'weeks').endOf('isoWeek').format('YYYY-MM-DD');
        break;
      case 'ThisMonth':
        start = moment().startOf('month').format('YYYY-MM-DD');
        end = moment().endOf('month').format('YYYY-MM-DD');
        break;
      default:
    }
    this.history.getBetHistory(start, end)
    .subscribe(res => {
      this.historyTotalGold = 0;
      this.historyTotalResult = 0;
      this.historyShowWin = 0;
      this.historyList = res.map(day => {
        day.showWin = Number(day.win) + Number(day.water);
        day.count = day.wc == 0 ? '' : day.wc;
        day.detailOk = false;
        day.details = [];
        if (day.gold) {
          this.historyTotalGold += Number(day.gold);
        }
        if (day.win) {
          this.historyTotalResult += Number(day.win);
        }
        this.historyShowWin += (Number(day.win) + Number(day.water));
        return day;
      });
      this.historyTotalGold = Number(this.historyTotalGold.toFixed(4));
      this.historyTotalResult = Number(this.historyTotalResult.toFixed(4));
      this.historyShowWin = Number(this.historyShowWin.toFixed(4));
      this.historySelected = -1;
      this.cd.markForCheck();
    });
  }
  /**
   * 取得金錢style
   * @param win
   */
  getResultClass(win) {
    if (win > 0) {
      return 'green';
    } else if (win < 0) {
      return 'red';
    }
    return '';
  }
}
