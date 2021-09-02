// Angular
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
// App
import { IMemberInfo } from '@app/ts/interface';
import { MemberService } from '@service/store-member.service';
// RxJS
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-surplus',
  templateUrl: './surplus.component.html',
  // styleUrls: ['./surplus.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SurplusComponent implements OnInit {

  constructor(
    public member: MemberService
  ) { }

  ngOnInit() {

  }

}
