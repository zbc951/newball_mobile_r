import { BallType, Ball } from '@app/ts/ball';
import { PlayType } from '@app/ts/play';
import { Odds } from '@app/ts/odds';
import { Moment } from 'moment';

export interface IHandicap {
  type: Odds;
  odds_H: string | number;
  odds_C: string | number;
  odds_N?: string | number;
  side_H: string;
  side_C: string;
  side_N?: string;
  head?: string;
  strong?: string;
}
export interface ITeamInfo {
  gameID: number; //賽事ID
  league: string; //聯盟名稱
  nameID_C: string; //客隊ID
  nameID_H: string; //主隊ID
  name_C: string; //客隊名稱
  name_H: string; //主隊名稱
  gameID1: number | string; //賽事上半ID
  gameID2: number | string; //賽事下半ID
  score_C: number; //客隊得分
  score_H: number; //主隊得分
  serial_C: string; //客隊場次編號
  serial_H: string; //主隊場次編號
}
export interface IGame {
  ball: Ball; //球種
  date: string; //比賽開始日期
  time: string; //比賽開始時間
  gamePassTime: string; //比賽經過時間
  hasScoreData: boolean; //是否有比對到的比分資料
  league: string; //聯盟名稱
  leagueID: number | string; //聯盟id
  gameID: number | string; //賽事id
  videoID: string; //直播id
  handicaps: IHandicap[]; //賽事賠率資料
  teamInfo: ITeamInfo; // 隊伍資訊
  picthers: any; //投手資訊
  PD?:any; //波膽資料
  isOpen: boolean; //是否開盤中
  location: string; //主.客.中立場次
}
export interface IGamesFile {
  lid: string | number;
  league: string;
  games: IGame[];
}

////////////////////////////////
class BallGamesFile extends BallType<IGamesFile[]> { }
export let allGamesDB = new PlayType(
  new BallGamesFile(),
  new BallGamesFile(),
  new BallGamesFile()
);
export function resetAllGamesDB() {
  allGamesDB = new PlayType(
    new BallGamesFile(),
    new BallGamesFile(),
    new BallGamesFile()
  );
}
////////////////////////////////
class BallGamesSavedTime extends BallType<Moment> { }
export const allGamesDB_SavedTime = new PlayType(
  new BallGamesSavedTime(),
  new BallGamesSavedTime(),
  new BallGamesSavedTime()
)
