// Angular
import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
// import { Location } from '@angular/common';
// Core
import { UidStatusService } from '@service/status-uid.service';
import { CreditService } from '@service/store-credit.service';
// More
import { Credit } from './credit-interface';
import { MoreComponent } from '@app/more/more.component';
import { RouterPath } from '@app/app.config';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/observable/from';
import { DEVICE } from '@app/app.config';


@Component({
  selector: 'app-credit',
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})

export class CreditComponent implements OnInit {
  // 目前選擇要展開詳細的球種
  select: number = -1;
  // 顯示的玩法列表
  playTypeList = ['2R', 'CPR', 'EO', 'F', 'FG', 'M', 'OU', 'PD', 'PM', 'PR', 'R', 'RE', 'REO', 'ROU', 'T'];
  /** 信用額度 */
  credit: Credit[] = [];
  // router資料
  RouterPath = RouterPath;

  constructor(
    private creditService: CreditService,
    // private location: Location,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.getCredit();
  }

  /**
   * 取得信用額度
   */
  private getCredit() {
    this.creditService.getAllCredits().subscribe(res => {
      Observable.from(res)
        .map(creditItem => {
          let ball = creditItem.gtype;
          switch (ball) {
            case 'BK': case 'BH': case 'BQ': case 'WB':
              ball = 'BK';
              break;
            case 'BS': case 'BF': case 'JB': case 'JF':
            case 'CB': case 'CF': case 'KB':
              ball = 'BS';
              break;
            default:
              break;
          }
          creditItem['ball'] = ball;
          return creditItem;
        })
        .toArray()
        .subscribe(credit => {
          this.credit = credit;
          this.cd.markForCheck();
        })
    });
  }

  /**
   * 展開列表
   */
  selectToggle(idx) {
    if (this.select === idx) {
      this.select = -1;
      return;
    }
    this.select = idx;
  }
  // previousPage() {
  //   this.location.back();
  // }
}
