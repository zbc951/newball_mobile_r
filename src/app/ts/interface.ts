import { Ball } from '@app/ts/ball';
import { Play } from '@app/ts/play';

export interface IMemberInfo {
  id: number | string;
  /** 玩家帳號 */
  username: string;
  /** 玩家暱稱 */
  alias: string;
  /** 今日額度 */
  maxcredit: number;
  /** 明日額度 */
  maxcredit1: number;
  /** 信用額度 */
  conf: IConf[];
  pro_viewmemo: string;
  /**習慣紀錄 */

}

export interface IDialog {
  dtype: string;
  text: string;
  callback: Function;
}
export interface IConf {
  mid: string;
  gtype: string;
  ltype: string;
  SC_R: string;
  SO_R: string;
  WAR_R: string;
  SE_R: string;
  SC_OU: string;
  SO_OU: string;
  WAR_OU: string;
  SE_OU: string;
  SC_M: string;
  SO_M: string;
  WAR_M: string;
  SE_M: string;
  SC_EO: string;
  SO_EO: string;
  WAR_EO: string;
  SE_EO: string;
  SC_2R: string;
  SO_2R: string;
  WAR_2R: string;
  SE_2R: string;
  SC_PR: string;
  SO_PR: string;
  WAR_PR: string;
  SE_PR: string;
  SC_CPR: string;
  SO_CPR: string;
  WAR_CPR: string;
  SE_CPR: string;
  SC_RE: string;
  SO_RE: string;
  WAR_RE: string;
  SE_RE: string;
  SC_ROU: string;
  SO_ROU: string;
  WAR_ROU: string;
  SE_ROU: string;
  SC_REO: string;
  SO_REO: string;
  WAR_REO: string;
  SE_REO: string;
  SC_PD: string;
  SO_PD: string;
  WAR_PD: string;
  SE_PD: string;
  SC_F: string;
  SO_F: string;
  WAR_F: string;
  SE_F: string;
  SC_T: string;
  SO_T: string;
  WAR_T: string;
  SE_T: string;
  SC_PM: string;
  SO_PM: string;
  WAR_PM: string;
  SE_PM: string;
  SC_FG: string;
  SO_FG: string;
  WAR_FG: string;
  SE_FG: string;
  SC_SPR: string;
  SO_SPR: string;
  WAR_SPR: string;
  SE_SPR: string;
}

export interface ICredit {
  SC: string | number;
  SO: string | number;

  RESC: string | number;
  RESO: string | number;
}


export interface IBetFile {
  teamInfo: any;
  gameID: number | string;
  strong: string;
  head: string;
  side: any;
  oddsType: any;
  odds: number;
  play: any;
  ball: Ball;
  nweBet: any;
}


export interface ILiveData {
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
  isOpened?: boolean;
  videoID?: string;
  league?: string;
  online?: number;
  CSSSize?: string;
  leftTime?: string;
  ct?: any;
  ht?: any;
  rtmp?: string;
  rtmpkey?: string;
  rtmpkey1?: string;
  rtmp_date?: string;
}
