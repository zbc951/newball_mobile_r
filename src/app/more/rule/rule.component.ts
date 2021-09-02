// Angular
import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
// import { Location } from '@angular/common';
// Core
import { UidStatusService } from '@service/status-uid.service';
import { ApiService } from '@service/api.service';
import { ConfigSetService } from '@service/config-set.service';
import { RouterPath } from '@app/app.config';

@Component({
  selector: 'app-rule',
  templateUrl: './rule.component.html',
  styleUrls: ['./rule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RuleComponent implements OnInit {

  notice = [];
  ballsTilte = [];
  ballsActive = [];
  RouterPath = RouterPath;

  constructor(
    private api: ApiService,
    private uidStatus: UidStatusService,
    private configSet: ConfigSetService,
    // private location: Location,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (this.configSet.lang === 'ja-jp') {
      this.ballsTilte = ['MAIN', 'BK', 'BS', 'FT', "WB"];
    } else {
      this.ballsTilte = ['MAIN', 'BK', 'BS', 'FT', "AF", "LO", "ST", "EK", "IB", "TN", "PO", "GD", "EB", "EF", "WB"];
    }
    this.ballsActive = this.ballsTilte.map(a => false);
    this.ballsActive[0] = true;
  }
}
