/** 比賽結果 */
export interface IGameResult {
  /** 聯賽名稱 */
  league: string;
  /** 日期 */
  date: string;
  /** 時間 */
  time: string;
  /** 主隊名稱 */
  homeTeam: string;
  /** 客隊名稱 */
  custTeam: string;
  /** 主隊上半場得分 */
  homeFirstHalf: string;
  /** 客隊上半場得分 */
  custFirstHalf: string;
  /** 主隊全場得分 */
  homeSecondHalf: string;
  /** 客隊全場得分 */
  custSecondHalf: string;

}
