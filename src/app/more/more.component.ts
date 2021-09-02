import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  template: '<router-outlet></router-outlet>',
  // styleUrls: ['./more.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoreComponent { }
