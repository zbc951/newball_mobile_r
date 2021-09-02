import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { DEVICE } from '@app/app.config';

@Directive({ selector: '[useDevice]' })
export class DeviceDirective {

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) { }

  @Input() set useDevice(condition: boolean) {
    if (condition && DEVICE.mobile) {
      this.viewContainer.clear();
    } else {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

}
