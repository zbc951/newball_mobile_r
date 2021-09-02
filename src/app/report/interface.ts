/**
 *開頭結尾日期
 */
export interface StartEndDate {
  thisStart: string;
  thisEnd: string;
  lastStart: string;
  lastEnd: string;
}

/**
 * 帳戶歷史的return結果
 */
export interface ReportHistory {
  /** 筆數  */
  wc: number;
  /** 下注金額  */
  gold: number;
  /** 可贏金額  */
  win: number;
  /** 退水  */
  water: number;
  /** 有效下注  */
  effective_gold: number;
  /** 日期  */
  date: string;
}

/**
 * 金額加總
 */
export interface GoldSum {
  /** 投注金額*/
  totGold: number;
  /** 有效下注*/
  totEffectiveGold: number;
  /** 結果 */
  totWin: number;
}

/**
 * 細單資料
 */
export interface IDateOrders {
  /** ID */
  id: string;
  /** 玩法 */
  wtype: string;
  /** 下注時間 */
  adddate: string;
  /** 帳務日期 */
  tworderdate: string;
  /** 方式 */
  gtype_c: string;
  /** 玩法 */
  wtype_c: string;
  /** 下注內容 */
  content: string;
  /** 下注金額 */
  gold: number;
  /** 可贏金額 */
  wingold: number;
}
