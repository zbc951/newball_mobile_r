import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef,
  Input, ElementRef, ViewChild
} from '@angular/core';
import { UnSubscribe } from 'lib/ng-component/unsubscribe';
import { DEFAULT } from '@app/app.config';
import { ApiService } from '@service/api.service';
import { UidStatusService } from '@service/status-uid.service';
import { ConfigSetService } from '@app/service/config-set.service';
import { OrderRemindService } from '@app/service/status-orders.service';
import { reduceCalSum } from 'lib/helper/reduce';

@Component({
  selector: 'game-order',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersComponent extends UnSubscribe implements OnInit {
  @Input() finish: boolean;
  @Input() close: Function;
  //注單列表
  orders = [];
  orderSelected = -1;
  // 總計投注
  totGold = 0;
  // 總計可贏
  totWin = 0;
  constructor(
    private cd: ChangeDetectorRef,
    private api: ApiService,
    private uidStatus: UidStatusService,
    private configSet: ConfigSetService,
    ) {
    super();
  }

  ngOnInit() {
    this.getOrders();
  }
  onClose() {
    this.close();
  }
  /**
   * 取得注單列表
   */
  private getOrders() {
    const req = { uid: this.uidStatus.uid, lang: this.configSet.lang };
    this.api.postServer(105, req)
      .map(res => res.ret)
      .subscribe(orders => {
        this.orders = orders.map(order => this.analysisOrder(order))
        this.totGold = Number(orders.reduce(reduceCalSum('gold'), 0).toFixed(2));
        this.totWin = Number(orders.reduce(reduceCalSum('wouldWin'), 0).toFixed(2));
        // console.log(this.orders);
        this.cd.markForCheck();
      });
  }
  /**
   * 分析注單內容
   * @param order
   */
  private analysisOrder(order) { 
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
        order.betTime = moment(order.adddate).format('MM/DD HH:mm');
        // 09/21 更新小數點算法 & 可營金額算法
        order.wouldWin = Math.floor(Number((Number(order.gold) * Number(order.odd)))*100)/100;
        order.odd =Math.floor(order.odd *100)/100;
        order.isResult = this.getResults(order);
        order.winlose = (Number(order.wingold) + Number(order.wgold_dm)).toFixed(2);
        break;
      default:
        order.gameName = (order.orderCont[12] == 2)?order.orderCont[7]:order.orderCont[0];
        order.partInfo = order.orderCont[1];
        order.bid = order.orderCont[2];
        order.team1 = (order.orderCont[12] == 2)?order.orderCont[8]:order.orderCont[3];
        order.head = (order.orderCont[4] && order.orderCont[4].length > 0)? order.orderCont[4] : 'Vs.';
        order.team2 = (order.orderCont[12] == 2)?order.orderCont[9]:order.orderCont[5];
        order.betOption = (order.orderCont[12] == 2)?order.orderCont[11] : order.orderCont[6];
        order.odd = (order.orderCont[12] == 2)?order.ioratio :order.orderCont[7];
        order.team1Score = order.orderCont[9];
        order.team2Score = order.orderCont[10];
        order.gameTime = moment(order.gdata.game_time).format('MM/DD HH:mm');
        order.betTime = moment(order.adddate).format('MM/DD HH:mm');
        order.wouldWin = Number((Number(order.gold) * Number(order.odd)).toFixed(2));
        order.isResult = this.getResults(order);
        order.winlose = (Number(order.wingold) + Number(order.wgold_dm)).toFixed(2);
        order.sp=order.orderCont[12];
    }
    return order;
  }
  /**
   * 回傳該注單的狀態
   * @param detail
   */
  getResults(detail) {
    var msg = '';
    var hasResult = false;
    switch (detail.result) {
      case 999:
        msg = 'Report.Confirming'; //html更換為'賽事確認中'
        break;
      case '':
      case '0':
        msg = 'Report.NotLottery'; //html更換為'未開獎'
        break;
      case 'NC':
        msg = 'Report.Canceled'; //html更換為'註銷'
        break;
      case 'N':
        msg = 'Report.GameCanceled'; //html更換為'退回'
        break;
      case '3':
        msg = 'Report.Wait'; //html更換為'賽果待定'
        break;
      case 'CHK':
        msg =  'Report.confirming'; //html更換為'審核中'
        break;
      case 'NOA':
        msg =  'Report.bet_fail'; //html更換為'下注失敗'
        break;
      default:
        msg = 'Report.HasResult';
        hasResult = true;
        break;
    }
    return {
      hasResult,
      msg
    };
  }
  /**
   * 回傳該注單的狀態
   * @param order
   */
  getResult(order, isTitle = false) {
    var w,d;
    w = order.wingold;
    d = order.wgold_dm;//wgold_dm //dmgold
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
}