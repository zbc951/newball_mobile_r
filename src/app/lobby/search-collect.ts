import { BallType, Ball } from '@app/ts/ball';
import { PlayType, Play } from '@app/ts/play';
import { IGame } from '@app/ts/game';


export interface ILeagueCollect {
  league: string;
  count: number;
}

export interface IDateCollect {
  date: string;
  count: number;
}
export class SearchCollect {
  dateCollects: IDateCollect[] = [];
  leagueCollects: ILeagueCollect[] = [];
}

class BallSearchCollect extends BallType<SearchCollect> { }

export const allSearchCollectDB = new PlayType(
  new BallSearchCollect(),
  new BallSearchCollect(),
  new BallSearchCollect()
);

export const collect = (play: Play, ball: Ball) => (game: IGame) => {

  let searchCollect: SearchCollect = allSearchCollectDB[play][ball];
  if (!!!searchCollect) { searchCollect = new SearchCollect(); }


  function process(collects: string, basis: string) {
    const idx = searchCollect[collects]
      .findIndex(collect => collect[basis] === game[basis]);

    if (idx === -1) {
      let collect: IDateCollect | ILeagueCollect = {} as IDateCollect | ILeagueCollect;
      collect[basis] = game[basis];
      collect.count = 1
      searchCollect[collects].push(collect);
    } else {
      searchCollect[collects][idx].count++;
    }
  }

  process('dateCollects', 'date');
  process('leagueCollects', 'league');

  allSearchCollectDB[play][ball] = searchCollect;
}
