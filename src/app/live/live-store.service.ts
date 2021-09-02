import { Injectable } from '@angular/core';
// Moment
import { Moment } from 'moment';
interface ILiveData {
  id: string;
  lid: string;
  tw_dt: string;
  strong: string;
  game_show: string;
  video: string;
  team_id_c: string;
  team_id_h: string;
  file: string;
  gtype: string;
  gtypes: string;
  tw_date: string;
  tw_time: string;
  color: string;
  mid: string;
}
@Injectable()

export class LiveStoreService {

  liveUpdateTime = 15;
  liveSavedTime: Moment;
  liveFile: ILiveData[];

  get() {
    const now: Moment = moment();
    const diffTime = now.diff(this.liveSavedTime, 'seconds');

    if (diffTime > this.liveUpdateTime) { this.liveFile = undefined; }

    return this.liveFile;
  }
  save(liveDatas: ILiveData[]) {
    this.liveFile = liveDatas;
  }


}
