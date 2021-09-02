import { Injectable } from '@angular/core';
import { ApiService } from '@app/service/api.service';
import { UidStatusService } from '@app/service/status-uid.service';
import { Ball } from '@app/ts/ball';

export interface IScore {
  c1?: string | number;
  c2?: string | number;
  c3?: string | number;
  c4?: string | number;
  ct?: string | number;
  cn?: string | number;
  h1?: string | number;
  h2?: string | number;
  h3?: string | number;
  h4?: string | number;
  ht?: string | number;
  hn?: string | number;
  rt?: string | number;
  gid?: string | number;
}
@Injectable()
export class ScoreService {

  private
  constructor(
    private api: ApiService,
    private statusUid: UidStatusService
  ) { }
  /**
   * 取得比分
   * @param _reqBall 包含要查詢的gid的球種陣列 EX:['FT', 'BS']
   * @param _reqGid  要查詢比分的賽事id
   */
  getScore(_reqBall: Ball[], _reqGid: string[]) {

    const reqGid = _reqGid.join(',');
    const reqBall = _reqBall.join(',');

    let req = { uid: this.statusUid.uid, gid: reqGid };
    if (reqBall.length > 0) {
      req['gtype'] = reqBall;
    }
    
    return this.api.postServer(430, req, false).map(res => res.ret);
  }

}
