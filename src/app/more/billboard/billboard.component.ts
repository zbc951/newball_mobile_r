// Angular
import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Location } from '@angular/common';
// Core
import { UidStatusService } from '@service/status-uid.service';
import { ApiService } from '@service/api.service';
import { ConfigSetService } from '@service/config-set.service';
import { RouterPath } from '@app/app.config';
import { TransLog,TransBet } from 'ts/translate-value';
@Component({
  selector: 'app-billboard',
  templateUrl: './billboard.component.html',
  styleUrls: ['./billboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillboardComponent implements OnInit {
  RouterPath = RouterPath;

  notice = [];
  tabIndex = 0;

  constructor(
    private api: ApiService,
    private uidStatus: UidStatusService,
    private configSet: ConfigSetService,
    private location: Location,
    private cd: ChangeDetectorRef
  ) { }
  
  ngOnInit() {
    this.getNotice();
  }
  /**
   * 取得公告資訊
   */
  private getNotice() {
    const req = { 'uid': this.uidStatus.uid, 'langx': this.configSet.lang };

    this.api.postServer(151, req).subscribe(apiRes => {
      this.notice = apiRes.ret;
      this.cd.markForCheck();
    });
  }
  setTab(index) {
    if (index > 0) {
      return alert(TransBet[this.configSet.lang]['Not_open']);
    } else {
      this.tabIndex = index;
    }
  }
  previousPage() {
    this.location.back();
  }
}
