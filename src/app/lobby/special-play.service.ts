import { Injectable } from '@angular/core';
import { ApiService } from '@service/api.service';
import { UidStatusService } from '@service/status-uid.service';
import { ConfigSetService } from '@app/service/config-set.service';
import { BetStatusService } from '@service/status-bet.service';
import { PlayStatusService } from '@service/status-play.service';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class SpecialPlayService {

  constructor(
    private api: ApiService,
    private uidStatus: UidStatusService,
    private configSet: ConfigSetService,
    private betStatus: BetStatusService,
    public playStatus: PlayStatusService,
  ) { }

  private SPdataInfoSubject: BehaviorSubject<any>= new BehaviorSubject([]);
  //預設基本盤
  SPdata$: Observable<any> = this.SPdataInfoSubject.asObservable();

    // setInterval 事件
    upData; 
    //更新秒
    s = 120;
    
    /**_gameID , _ball*/
    lockingID = ['',''];
    onUPdata(_gameID,_ball){
      this.lockingID = [_gameID,_ball];
      this.getSPdata(_gameID,_ball);
      this.upData = setInterval(() => {
        this.getSPdata(_gameID,_ball);
      }, this.s * 1000);
    }
    closeUPdata(){
      this.SPdataInfoSubject.next([]);
      this.lockingID = ['',''];
      clearInterval(this.upData);
    }

  /**
   * 特殊玩法
   */
  getSPdata(_gameID,_ball){
    const req = { uid: this.uidStatus.uid, lang: this.configSet.lang ,gid : _gameID ,gtype: _ball};

    this.api.postServer(130, req)
      .map(res => res.ret)
      .subscribe(data => {
        this.SPdataInfoSubject.next(data);
        console.log('SPdata',data);
      });
  }
  /**立即更新 */
  nowUPdata(){
    console.log(this.lockingID);
    if(this.lockingID[0] && this.lockingID[1]){
      this.getSPdata(this.lockingID[0],this.lockingID[1]);
    }
  }
}
