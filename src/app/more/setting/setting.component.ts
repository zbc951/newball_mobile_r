import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
// import { Location } from '@angular/common';
import { appBalls, IAppBalls, Ball } from 'ts/ball';
import { ConfigSetService, Lang } from '@app/service/config-set.service';
import { UidStatusService } from '@app/service/status-uid.service';
import { ApiService } from '@app/service/api.service';
import { MemberService } from '@app/service/store-member.service';
import { RouterPath } from '@app/app.config';

import { objCopy } from 'lib/helper/copy';
import { TransSetting } from 'ts/translate-value';
import { BallStatusService } from '@app/service/status-ball.service';
import { DEFAULT } from '@app/app.config';
import { DialogStatusService } from '@app/service/status-dialog.service';
@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingComponent {
  RouterPath = RouterPath;
  // 目前選擇語言
  private lang = this.configSet.lang;
  // 是否為現金版
  isCashVer = DEFAULT.isCashVer;
  // 是否為中國版
  isCN = DEFAULT.isCN;
  // 球種資料
  appBalls = appBalls;
  // 語言
  Lang = Lang;
  // 目前暫存的球種
  selectedBall: Ball = this.configSet.ball;
  // 目前暫存的語言
  selectedLang: Lang = this.configSet.lang;
  // 密碼input
  pwd: string = '';
  // 密碼確認input
  confirmPwd: string = '';
  // 語言選項陣列
  langList = [
    {name: '繁體中文',lang: Lang.TW},
    {name: '简体中文',lang: Lang.CN},
    {name: '日本語',lang: Lang.JP},
  ];
  // 語言選擇器資料
  langPicker = {
    selectedItem: this.langList.filter(lang => lang.lang === this.configSet.lang)[0],
    active: false
  }
  // 球種選擇器資料
  ballPicker = {
    selectedItem: this.appBalls.filter(ball => ball.value === this.configSet.ball)[0],
    active: false
  }
  constructor(
    private configSet: ConfigSetService,
    private api: ApiService,
    private statusUid: UidStatusService,
    private statusBall: BallStatusService,
    private member: MemberService,
    private dialog: DialogStatusService,
    private cd: ChangeDetectorRef,
    // private location: Location,
  ) { }
  /**
   * 設定預設球種及語言
   */
  confirmSet() {
    this.statusBall.ball = this.ballPicker.selectedItem.value;
    this.configSet.ball = this.ballPicker.selectedItem.value;
    this.configSet.saveLang(this.langPicker.selectedItem.lang);
    this.appBalls = objCopy(appBalls);
    this.dialog.alert(TransSetting[this.lang]['Success']);
  }
  // confirmSet() {
  //   this.statusBall.ball = this.selectedBall;
  //   this.configSet.ball = this.selectedBall;
  //   this.configSet.saveLang(this.selectedLang);
  //   this.appBalls = objCopy(appBalls);
  //   alert(TransSetting[this.lang]['Success']);
  // }
  ngOnInit() {
  }
  /**
   * 更改密碼
   */
  changePwd() {
    const pwd = this.pwd.trim();
    const confirmPwd = this.confirmPwd.trim();

    if (!!!pwd || pwd !== confirmPwd) { this.dialog.alert(TransSetting[this.lang]['Rewrite']); return; }

    const req = {
      uid: this.statusUid.uid, id: this.member.memberInfo.id, newpass: pwd
    };
    this.api.postServer(401, req).subscribe(() => {
      this.dialog.alert(TransSetting[this.lang]['Success']);
      this.pwd = '';
      this.confirmPwd = '';
      this.cd.markForCheck();
    });
  }
  /**
   * 關閉/開啟 選擇語言視窗
   */
  toggleChooseLang() {
    this.ballPicker.active = false;
    this.langPicker.active = !this.langPicker.active;
  }
  /**
   * 關閉/開啟 選擇球種視窗
   */
  toggleChooseBall() {
    this.langPicker.active = false;
    this.ballPicker.active = !this.ballPicker.active;
  }
  /**
   * 設置暫存語言
   * @param lang 
   */
  setLang(lang) {
    this.langPicker.selectedItem = lang;
    this.toggleChooseLang();
  }
  /**
   * 設置暫存球種
   * @param ball 
   */
  setBall(ball) {
    this.ballPicker.selectedItem = ball;
    this.toggleChooseBall();
  }


}
