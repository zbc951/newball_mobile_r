// Angular
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
// App
import { RouterPath } from '@app/app.config';
import { OrderRemindService } from '@service/status-orders.service';
import { DEFAULT } from '@app/app.config';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  // styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {

  RouterPath = RouterPath;
    // 是否為現金版
    isCashVer = DEFAULT.isCashVer;

  constructor(
    public orderRemind: OrderRemindService
  ) { }



}
