import { Component, ChangeDetectionStrategy } from '@angular/core';
import { StatusMenuService } from '@service/status-menu.service';

@Component({
  selector: 'app-menu-ctrl',
  templateUrl: './menu-ctrl.component.html',
  // styleUrls: ['./menu-ctrl.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuCtrlComponent {

  constructor(public statusMenu: StatusMenuService) { }
}
