// Angular
import { Injectable } from '@angular/core';
// App
import { Play, playUpdateTime } from 'ts/play';
import { Ball } from 'ts/ball';
import { IGamesFile, allGamesDB, allGamesDB_SavedTime, resetAllGamesDB } from 'ts/game';
// Moment
import { Moment } from 'moment';
import { ConfigSetService, Lang } from '@service/config-set.service';

@Injectable()
export class GamesStoreService {

  constructor(private configSet: ConfigSetService) {
    this.isLangChange();
  }

  private isLangChange() {
    this.configSet.langChange$.subscribe((lang: Lang) => resetAllGamesDB())
  }

  get(play: Play, ball: Ball): IGamesFile[] {

    let gameFile: IGamesFile[] = allGamesDB[play][ball] || undefined;

    if (!!gameFile) {
      const now: Moment = moment();
      const diffTime = now.diff(allGamesDB_SavedTime[play][ball], 'seconds');

      if (diffTime > playUpdateTime[play]) { gameFile = undefined; }
    }

    return gameFile;
  }

  save = (play: Play, ball: Ball) => (gameList: IGamesFile[]) => {
    allGamesDB_SavedTime[play][ball] = moment();
    allGamesDB[play][ball] = gameList;
  }

}
