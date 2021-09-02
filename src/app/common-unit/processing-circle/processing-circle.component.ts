// Angular
import {
  Component, ChangeDetectionStrategy, Input, Output, EventEmitter,
  OnInit, OnChanges, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
// RxJS
import 'rxjs/add/operator/takeUntil';
// lib
import { UnSubscribe } from 'lib/ng-component/unsubscribe';
import { ProcessingCircleStatusService } from '@app/service/status-processing-circle.service';

@Component({
  selector: 'app-processing-circle',
  templateUrl: './processing-circle.component.html',
  styleUrls: ['./processing-circle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessingCircleComponent extends UnSubscribe {
  isOpen:boolean = false;
  constructor(
    public pcStatus: ProcessingCircleStatusService,
    private cd: ChangeDetectorRef
  ) {
    super();
    super.ngOnDestroy();
  }

  ngOnInit() {
    this.openListener();
  }
  private openListener() {
    this.pcStatus.isOpen$.takeUntil(this.unSubscribe).subscribe((isOpen: boolean) => {
      this.isOpen = isOpen;
      this.cd.markForCheck();
    });
  }
  closePage() {
    this.pcStatus.close();
  }

}
