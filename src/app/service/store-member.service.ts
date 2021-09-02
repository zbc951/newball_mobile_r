// Angular
import { Injectable } from '@angular/core';
// App
import { Ball } from '@app/ts/ball';
import { IMemberInfo } from '@app/ts/interface';
import { ApiService } from '@service/api.service';
import { UidStatusService } from '@service/status-uid.service';
import { ChatService } from '@shared-chat/chat.service';

import { ConfigSetService } from '@app/service/config-set.service';
// RxJS
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { DEFAULT } from '@app/app.config';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class MemberService {
  private firstUpdateName = true;
  private uid: string = this.uidStatus.uid;
  memberInfo: IMemberInfo;
  private memberInfoSubject: ReplaySubject<IMemberInfo> = new ReplaySubject(1);
  memberInfo$ = this.memberInfoSubject.asObservable();
  liveST = DEFAULT.liveST || 'com';

  SPname:any ;

  constructor(
    private api: ApiService,
    private uidStatus: UidStatusService,
    private chat: ChatService,
    public configSet: ConfigSetService,
    private translate: TranslateService,
  ) {
    this.updateMemberInfo();
    this.upSPname();
  }


  /**
   * 更新會員資料
   * @param uid
   */
  updateMemberInfo() {

    const req = { uid: this.uid };

    this.api.postServer(400, req).map(res => res.ret as IMemberInfo)
      .do(memberInfo => {
        if (this.firstUpdateName) {
          this.firstUpdateName = false;
          let name = '帥哥';
          if (memberInfo.alias && memberInfo.alias.length > 0) {
            name = this.getMosaicName(memberInfo.alias);
            // if (memberInfo.alias === memberInfo.username) {
            //   name = this.getMosaicName(memberInfo.alias);
            // } else {
            //   name = memberInfo.alias;
            // }
          }
          this.chat.updateUserName(this.liveST + '_' + memberInfo.username, name);
        }
        this.getConfigSet(memberInfo.pro_viewmemo);
        this.memberInfoSubject.next(memberInfo);
        this.memberInfo = memberInfo
      }).subscribe();
  }
  getMosaicName(name: string) {
    if (name.length >= 6) {
      return '***' + name.slice(-4);
    } else {
      return '***' + name.slice(-2)
    }
  }
  getConfigSet(_pro_viewmemo){
    console.log(_pro_viewmemo);
    if(!_pro_viewmemo){return}
    let replace_viewmemo =_pro_viewmemo.replace(/\^/g,'"');
    let pro_viewmemo = eval('('   +replace_viewmemo+  ')');
    console.log(pro_viewmemo);
    this.configSet.setOdd(pro_viewmemo['bet']);
    this.configSet.night = pro_viewmemo['white'];
    this.configSet.beginner = pro_viewmemo['beginner'];
    this.configSet.orderLeague = pro_viewmemo['orderLeague'];
  }
  upSPname(){
    this.api.postServer(132, { uid: this.uidStatus.uid ,lang: this.configSet.lang})
    .do(apiRes =>{
      console.log(apiRes,'upSPname');
      this.translate.translations[this.configSet.lang]['special'] = apiRes.ret
      console.log(this.translate.translations[this.configSet.lang]);
      this.SPname = apiRes.ret;
    } ).subscribe();
  }

}
