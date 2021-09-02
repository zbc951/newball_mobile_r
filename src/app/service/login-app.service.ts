// Angular
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
// App
import { RouterPath } from '@app/app.config';
import { UidStatusService } from '@service/status-uid.service';

@Injectable()
export class LoginAppService {

  constructor(
    private router: Router,
    private uidStatus: UidStatusService
  ) { }
  /**
   * 登入
   * @param uid 
   */
  login(uid: string) {
    // jQuery('meta[name=viewport]').attr('content',``); //將畫面調整移除
    this.uidStatus.uid = uid;
    this.router.navigate(RouterPath.lobby); //前往遊戲大廳
  }
  /**
   * 登出
   */
  logout() {
    if (location.search.length > 1) {
      location.search = '';
    } else {
      location.href = '';
    }
    this.uidStatus.clear();
    // this.router.navigate(RouterPath.login);
  }

}
