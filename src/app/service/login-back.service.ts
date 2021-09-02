// Angular
import { Injectable } from '@angular/core';
// App
import { LoginAppService } from '@service/login-app.service';
import { ApiService, APIResponse } from '@service/api.service';
import { UidStatusService } from '@service/status-uid.service';
// RxJS
import { Observable } from 'rxjs/Observable';

import { TransLoginBackService } from 'ts/translate-value';
import { ConfigSetService } from '@app/service/config-set.service';
import { DialogStatusService } from '@app/service/status-dialog.service';
enum loginMsg {
  success = 0,      // 成功
  inputError = -1,  // 帳號或密碼錯誤
  pleaseWait = -2   // 系統忙碌中，請稍後重新登入
}

@Injectable()

export class LoginBackService {

  private lang = this.configSet.lang;
  constructor(
    private api: ApiService,
    private loginApp: LoginAppService,
    private configSet: ConfigSetService,
    private uidStatus: UidStatusService,
    private dialog: DialogStatusService
    ) { }

  /**
   * 進行登入動作
   * @param id 
   * @param pwd 
   */
  login(id: string, pwd: string, callback = () => {}) {

    const req = { sAcc: id, sPwd: pwd }; //
    this.api.resetAlert();
    this.api.postServer(999, req).map(apiRes => apiRes.ret).subscribe((ret) => {

      // 登入訊息
      const msg = loginMsg[ret[0]];
      callback();
      switch (msg) {
        case 'success':
          const uid = ret[1];
          this.loginApp.login(uid);
          break;
        case 'inputError': this.dialog.alert(TransLoginBackService[this.lang]['InputError']);
          break;
        case 'pleaseWait': this.dialog.alert(TransLoginBackService[this.lang]['PleaseWait']);
          break;
        default:
          break;
      }
    });

  }
  /**
   * 進行登出
   */
  logout() {
    const req = { 'uid': this.uidStatus.uid };
    this.api.postServer(997, req).subscribe();

    this.loginApp.logout();
  }


}
