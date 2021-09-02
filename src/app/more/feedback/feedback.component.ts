// Angular
import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
// import { Location } from '@angular/common';
// Core
import { UidStatusService } from '@service/status-uid.service';
import { ApiService } from '@service/api.service';
// lib
import { formatDate, addHours } from 'lib/helper/date';
import { TransFeedback } from 'ts/translate-value';
import { ConfigSetService } from '@app/service/config-set.service';
import { DialogStatusService } from '@app/service/status-dialog.service';
import { MemberService } from '@service/store-member.service';

/** 問題反應結果顯示 */
export interface Response {
  /** 反應日期 */
  adddate: string;
  /** 反應內容 */
  problem: string;
  /** 回覆 */
  reply: string;
}

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackComponent implements OnInit {


  private uid = this.uidStatus.uid;
  private lang = this.configSet.lang;
  contact: string;
  content: string;
  response: Response[];
  feedbackEnable = false;
  myFeedbackActive = false;

  constructor(
    private api: ApiService,
    private uidStatus: UidStatusService,
    private configSet: ConfigSetService,
    // private location: Location,
    private cd: ChangeDetectorRef,
    private dialog: DialogStatusService,
    public member: MemberService
    ) { }

  ngOnInit() {
    this.getMessage();
  }

  /**
   * 取得表單內容
   */
  private getMessage() {
    const req = { uid: this.uid, type: 'dget' };

    this.api.postServer(212, req).subscribe(res => {

      const feedbackFiles = res.ret.reverse();

      this.response = feedbackFiles.map(item => {
        // 加 12 小時
        const originTime = item.adddate.split(' ');
        const newTime = addHours(new Date(originTime[0] + ' ' + originTime[1]), 12);
        item.adddate = formatDate(newTime, true);
        return item;
      });
      this.cd.markForCheck();
    });
  }

  /**
   * 送出訊息
   * @param contact
   * @param content
   */
  sendMessage(contact, content) {
    const req = { uid: this.uid, type: 'dins', tel: contact, problem: content };

    this.api.postServer(212, req).subscribe(() => {
      this.getMessage();
      this.contact = '';
      this.content = '';
      // this.dialog.alert(TransFeedback[this.lang]['Submit']);
      this.myFeedbackActive = true;
      this.cd.markForCheck();
    });
  }

}
