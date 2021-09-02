import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { DeviceDirective } from './device.directive';
import { FormatNumberPipe } from './format-number.pipe';
import { ArraySplitPipe } from './array-split.pipe';
import { TranslateValuePipe } from './translate-value.pipe';

import { MenuCtrlComponent } from './menu-ctrl/menu-ctrl.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule
  ],
  declarations: [
    DeviceDirective,
    FormatNumberPipe,
    ArraySplitPipe,
    TranslateValuePipe,
    MenuCtrlComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    DeviceDirective,
    FormatNumberPipe,
    ArraySplitPipe,
    TranslateValuePipe,
    MenuCtrlComponent,
  ]
})
export class SharedCoreModule { }
