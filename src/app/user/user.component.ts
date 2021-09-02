// Angular
import { Component, ChangeDetectorRef, OnInit, ChangeDetectionStrategy } from '@angular/core';
// ts
import { RouterPath } from '@app/app.config';
import { DEFAULT } from '@app/app.config';
// service
import { MemberService } from '@service/store-member.service';
import { LoginBackService } from '@service/login-back.service';
import { ConfigSetService } from '@app/service/config-set.service';
import { UidStatusService } from '@app/service/status-uid.service';
import { ApiService } from '@app/service/api.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class UserComponent implements OnInit {
  // router設定
  RouterPath = RouterPath;
  // 是否顯示設定畫面
  settingShow:Boolean = false;
  // 是否為現金版
  isCashVer = DEFAULT.isCashVer;

  //手機操作教學
  help = false;

  help_key='';
  page = {
    'body':4,
    'single_bet':8,
    'multiple_bet':10,
    'history':3,
  }
  page_1 = 1;
  constructor(
    public member: MemberService,
    private loginBack: LoginBackService,
    public configSet: ConfigSetService,
    
    public statusUid: UidStatusService,
    private api: ApiService,
  ) { }

  ngOnInit() {
  }
  //登出
  logout() {
    this.loginBack.logout();
  }
  setOdd() {
    this.configSet.setOdd(!this.configSet.openHKodd);
  }
  helpOn(){
    this.help =!this.help;
    if(!this.help){
      this.closeHelp();
    }
  }
  helpSelect(_key){
    this.help_key = _key;
  }
  NextPage(){
    this.page_1++;
    console.log(this.page_1);
    if(this.page_1 > this.page[this.help_key]){
      this.closeHelp();
    }
  }
  closeHelp(){
    this.help_key = '';
    this.page_1 = 1;
  }
  againb(){
    this.page_1 = 1;
  }
  change_settingShow(_boolean:Boolean){
    this.settingShow = _boolean;
    if(!_boolean ){
      let gameSwitchData={
        beginner:this.configSet.beginner,  //新手版-專業版
        orderLeague:this.configSet.orderLeague, //聯盟-時間
        bet:this.configSet.openHKodd , //盤口賠率 香港.歐洲
        white:this.configSet.night //風格 日-夜 
      }
      let JSON_stringify = JSON.stringify(gameSwitchData);
      let replace =JSON_stringify.replace(/\"/g,'^');
      const req = { 'uid': this.statusUid.uid, 'pro_viewmemo': replace };
      this.api.postServer(403, req).subscribe(apiRes => {
      });  
    }
  }
  
  goPCweb() {
    sessionStorage.setItem('loginUid', this.statusUid.uid);
    setTimeout(() => {
      location.href='/?uid='+this.statusUid.uid+'&ispc=Y';
    },500);
   
  }
};

