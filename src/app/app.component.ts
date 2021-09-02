// Angular
import { Component, ViewEncapsulation } from '@angular/core';
// Service
import { NameChartService } from '@service/name-chart.service';
import { ConfigSetService } from '@service/config-set.service';
import { UidStatusService } from '@service/status-uid.service';
import { LazyManualService } from '@service/lazy-manual.service';
import { UnSubscribe } from 'lib/ng-component';

import { appendLoader, loader } from 'lib/loader';
import { getURLParameter } from 'lib/helper';
import { Route } from '@angular/compiler/src/core';
import { Router } from '@angular/router';
import { LoginAppService } from '@app/service/login-app.service';

import { DEFAULT, DEVICE } from '@app/app.config';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: [`app-platform{
    position: absolute;
    top: 0;
    z-index: 99;
    background: white;
    width: 100%;
  }`],
  // styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent extends UnSubscribe {
  DEVICE = DEVICE;
  constructor(
    public uidStatus: UidStatusService,
    public configSet: ConfigSetService,
    private nameChart: NameChartService,
    private appLogin: LoginAppService,
    public lazyManual: LazyManualService,
    public router: Router
  ) {
    super();
  }

  ngOnInit() {
    this.isCashVer();
    this.configSet.defaultSet();
    this.preLoadNameChart();
    this.prepareLoad();
    appendLoader();
  }

  private isCashVer() {
    if (!DEFAULT.isCashVer) { return; }
    const uid = getURLParameter('uid');
    if (uid) { this.appLogin.login(uid); }
  }

  private preLoadNameChart() {
    this.nameChart.getAllNameChart();
  }

  private prepareLoad() {
    this.lazyManual.menuStatusListener();
    this.lazyManual.betStatusListener().takeUntil(this.unSubscribe).subscribe();
    this.lazyManual.platformStatusListener().takeUntil(this.unSubscribe).subscribe();
  }

}
