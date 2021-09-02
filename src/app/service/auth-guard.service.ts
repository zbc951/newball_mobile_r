// Angular
import { Injectable } from '@angular/core';
import { CanActivate, CanLoad } from '@angular/router';
// App
import { LoginAppService } from '@service/login-app.service';
import { UidStatusService } from '@service/status-uid.service';

@Injectable()

/* 路由權限管理服務 */
export class AuthGuardService implements CanLoad, CanActivate {

  constructor(
    private loginApp: LoginAppService,
    private uidStatus: UidStatusService
  ) { }

  canLoad() {
    return this.checkLogin();
  }

  canActivate() {
    return this.checkLogin();
  }

  private checkLogin() {
    if (this.uidStatus.uid) {
      sessionStorage.setItem('first', '1');
      return true;
    }
    this.loginApp.logout();
    return false;
  }

}
