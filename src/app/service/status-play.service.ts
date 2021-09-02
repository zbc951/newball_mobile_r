// Angular
import { Injectable } from '@angular/core';
// App
import { Play } from '@app/ts/play';
// RxJS
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Injectable()
//儲存目前玩法的狀態 (單式.走地.過關)
export class PlayStatusService {

  private _play: Play = Play.single;
  private playSubject: BehaviorSubject<Play> = new BehaviorSubject(this._play);
  play$: Observable<Play> = this.playSubject.asObservable();

  set play(play: Play) {
    this._play = play;
    this.playSubject.next(play);
  }

  get play(): Play {
    return this._play;
  }


}
