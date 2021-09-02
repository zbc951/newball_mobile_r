// Angular
import { Injectable } from '@angular/core';
// App
import { Ball } from '@app/ts/ball';
import { IConf } from '@app/ts/interface';
import { MemberService } from './store-member.service';
// RxJS
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CreditService {

  constructor(
    private member: MemberService
  ) { }


  /**
   * 各球種信用額度
   * @param uid
   */
  getAllCredits(): Observable<IConf[]> {

    if (this.member.memberInfo) {
      return Observable.of(this.member.memberInfo.conf);
    } else {
      // this.member.updateMemberInfo();
      return this.member.memberInfo$.map(memberInfo => memberInfo.conf);
    }

  }

  /**
   * 特定球種信用額度
   * @param uid
   */
  getBallCredits(ball: Ball | string) {
    return this.getAllCredits()
      .map((conf: any) => {
        return conf.find(item => item['gtype'] === ball);
      });
  }

}
