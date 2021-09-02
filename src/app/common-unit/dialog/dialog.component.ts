// Angular
import {
  Component, ChangeDetectionStrategy, Input, Output, EventEmitter,
  OnInit, OnChanges, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { IDialog } from '@app/ts/interface';
import { FormControl, Validators } from '@angular/forms';
// RxJS
import 'rxjs/add/operator/takeUntil';
// lib
import { UnSubscribe } from 'lib/ng-component/unsubscribe';
import { DialogStatusService } from '@app/service/status-dialog.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogComponent extends UnSubscribe {
  isOpen:boolean = false;
  dialogData: IDialog;

  callback = () => {};
  constructor(
    public dialog: DialogStatusService,
    private cd: ChangeDetectorRef
  ) {
    super();
    super.ngOnDestroy();
  }

  ngOnInit() {
    this.openListener();
  }
  private openListener() {
    this.dialog.dialogContent$.takeUntil(this.unSubscribe).subscribe((dialogContent: IDialog) => {
      if (dialogContent.dtype === 'alert' || dialogContent.dtype === 'confirm') {
        this.isOpen = true;
        this.dialogData = dialogContent;
        this.cd.markForCheck();
      }
    });
  }
  cancel() {
    this.isOpen = false;
  }
  doConfirm() {
    this.dialogData.callback();
    this.isOpen = false;
  }
  closePage() {
    // this.dialog.close();
  }

}
