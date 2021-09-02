// Angular
import { Component, ChangeDetectionStrategy, OnInit,ViewChild } from '@angular/core';
// App
import { UidStatusService } from '@service/status-uid.service';
import { LoginAppService } from '@service/login-app.service';
import { LoginBackService } from '@service/login-back.service';
import { ConfigSetService, Lang } from '@service/config-set.service';
// lib
import { LocalStorage } from 'lib/storage';
import { DEFAULT } from '@app/app.config';
import { DialogStatusService } from '@app/service/status-dialog.service';
import { TransLog } from 'ts/translate-value';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  @ViewChild('slideBar') slideBar;

  id: string = '';
  pwd: string = '';
  remember: boolean;
  Lang = Lang;
  isCashVer = DEFAULT.isCashVer;
  specialIcon = ''; //比較特殊的網址進入給不同icon
  startX = 0;
  viewWidth = 0;
  initWidth = 26;
  widthExp = 26;
  logining = false;

  constructor(
    private statusUid: UidStatusService,
    private loginBack: LoginBackService,
    private loginApp: LoginAppService,
    private configSet: ConfigSetService,
    private dialog: DialogStatusService
    ) { }

  ngOnInit() {
    this.setWindowSize();

    if (this.statusUid.uid) {
      this.loginApp.login(this.statusUid.uid);
    }

    if (LocalStorage.getItem('remember')) {
      this.id = LocalStorage.getItem('id');
      this.pwd = LocalStorage.getItem('pwd');
      this.remember = LocalStorage.getItem('remember');
    }
    //處理特殊網址
    switch(location.host) {
      case '2fra-web.sog88.net':  //big1
      case 'www.fa669.com':
      case 'wpc.fa669.com':
      case 'wcn.fa669.com':
      case 'bs005.3gpstore.com':
          // document.getElementById("title").innerHTML = '法拉利';
          this.specialIcon = 'fa';
          break;
      case 'web.wd77777.net':   //big8
      case 'wbg.wd77777.net':
          this.specialIcon = 'wd';
          // document.getElementById("title").innerHTML = '新雲頂';
          break;
    }
  }
  ngAfterViewInit() {
    this.viewWidth = this.slideBar.nativeElement.clientWidth;
  }
  /**起始 */
  onPanStart(event: any): void {
    this.startX = event.deltaX;
  }
  /**拖移 */
  onPan(event: any): void {
    event.preventDefault();
    let x=  event.deltaX - this.startX  
    if(x <0 ){
        this.widthExp = this.initWidth;
    }else{
        if((this.initWidth+(x/(this.viewWidth/2) ) *60) >90){
            this.widthExp = 100
            this.login();
            return;
        }
        this.widthExp =  this.initWidth+(x/(this.viewWidth/2) ) *60;

    }
  }
  /**結束 */
  onPanEnd(event: any): void {
    if (this.widthExp < 100) {
      this.widthExp = this.initWidth
    }
  }

  getGETparam(key) {
    let strUrl = location.search;
    let getPara;
    if (strUrl.indexOf("?") != -1) {
      let getSearch = strUrl.split("?");
      getPara = getSearch[1].split("&");
      for (let i = 0; i < getPara.length; i++) {
        let ParaVal = getPara[i].split("=");
        if (ParaVal[0] === key) {
          return ParaVal[1];
        }
      }
    }
    return false;
  }

  setWindowSize() {
    // $("head").append(`<meta id="sizeCtrl" name="viewport" content="width=device-width, user-scalable=no,initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">`);  

  }

  login() {
    if (this.logining) return;
    this.logining = true;
    this.widthExp = this.initWidth;

    if (this.id.trim() === '' || this.pwd.trim() === '') {
      this.dialog.alert(TransLog[this.configSet.lang]['CompleteAandP']);
      this.logining = false;
      return;
    }

    this.isRemember();
    this.loginBack.login(this.id, this.pwd, () => {
      this.logining = false;
    });
    
  }
  /**
   * 清除紀錄
   */
  clearAll() {
    this.id = '';
    this.pwd = '';
    LocalStorage.removeItem('id');
    LocalStorage.removeItem('pwd');
    LocalStorage.removeItem('remember');
    this.remember = false;
  }
  /**
   * 取得設定
   */
  isRemember() {
    if (this.remember) {
      LocalStorage.setItem('id', this.id);
      LocalStorage.setItem('pwd', this.pwd);
      LocalStorage.setItem('remember', this.remember);
    } else {
      LocalStorage.removeItem('id');
      LocalStorage.removeItem('pwd');
      LocalStorage.removeItem('remember');
    }
  }

  changeLang(lang: Lang) {
    this.configSet.lang = lang;
  }
}
