/**
 *日期間隔天數
 */
export function dateRange(start, end) {
  const startDate: any = new Date(start);
  const endDate: any = new Date(end);
  return Math.round((endDate - startDate) / 86400000);
}

/**
 * 格式化日期 yyyy-mm-dd
 * @param date
 * @param full 是否取得完整訊息
 */
export function formatDate(date, full?: boolean) {
  const d = new Date(date);
  const year = d.getFullYear();
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  let hours = '' + d.getHours();
  let minutes = '' + d.getMinutes();

  if (month.length < 2) {
    month = '0' + month;
  }
  if (day.length < 2) {
    day = '0' + day;
  }
  if (hours.length < 2) {
    hours = '0' + hours;
  }
  if (minutes.length < 2) {
    minutes = '0' + minutes;
  }

  if (full) {
    return [year, month, day].join('-') + ' ' + [hours, minutes].join(':');
  }
  return [year, month, day].join('-');
}

/**
 * 雙週開頭結尾日期
 */
export function getBiWeek() {
  const now = new Date(); 							// 當前日期
  const nowDayOfWeek = now.getDay(); 		// 今天本周的第幾天
  const nowDay = now.getDate(); 				// 當前日
  const nowMonth = now.getMonth(); 			// 當前月
  let nowYear = now.getFullYear(); 			// 當前年
  nowYear += (nowYear < 2000) ? 1900 : 0;
  const formatDate = function (date) {
    const myyear = date.getFullYear();
    let mymonth = date.getMonth() + 1;
    let myweekday = date.getDate();
    if (mymonth < 10) { mymonth = '0' + mymonth; }
    if (myweekday < 10) { myweekday = '0' + myweekday; }
    return (myyear + '-' + mymonth + '-' + myweekday);
  };
  // 獲得本周的開端日期
  const weekStartDate = formatDate(new Date(nowYear, nowMonth, nowDay - nowDayOfWeek + 1));
  // 獲得本周的停止日期
  const weekEndDate = formatDate(new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek + 1)));
  // 獲得上周的開端日期
  const lastWeekStartDate = formatDate(new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 7 + 1));
  // 獲得上周的停止日期
  const lastWeekEnd = formatDate(new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 1 + 1));

  return {
    'thisStart': weekStartDate,
    'thisEnd': weekEndDate,
    'lastStart': lastWeekStartDate,
    'lastEnd': lastWeekEnd
  };
}

/**
 * 本月&上月 開頭結尾日期
 */
export function getMonth() {
  const date = new Date(), year = date.getFullYear(), month = date.getMonth();
  const firstDay = formatDate(new Date(year, month, 1));  // 本月起始日期
  const lastDay = formatDate(new Date(year, month + 1, 0));  // 本月結束日期

  const ldate = new Date(), lyear = ldate.getFullYear(), lmonth = ldate.getMonth() - 1;
  const lastWeekFirstDay = formatDate(new Date(lyear, lmonth, 1));  // 上月起始日期
  const lastWeekLastDay = formatDate(new Date(lyear, lmonth + 1, 0));  // 上月起始日期

  return {
    'thisStart': firstDay,
    'thisEnd': lastDay,
    'lastStart': lastWeekFirstDay,
    'lastEnd': lastWeekLastDay
  };

}

/**
 * 時間加幾小時
 * @param date 日期
 * @param addHours 要加幾小時
 */
export function addHours(date, addHours) {
  const n = date.setHours(date.getHours() + addHours);
  return new Date(n);
}


export enum DayCase {
  today = 'today',
  yesterday = 'yesterday',
  dayBeforeYesterday = 'dayBeforeYesterday'
}
/**
 * 取得 今天 | 昨天 | 前天 的日期
 * @param day
 */
export function formatDayToDate(day: string) {

  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth();
  const date = d.getDate();

  let resultDate;

  switch (day) {
    case 'today':
      resultDate = formatDate(new Date(year, month, date));
      break;

    case 'yesterday':
      resultDate = formatDate(new Date(year, month, date - 1));
      break;

    case 'dayBeforeYesterday':
      resultDate = formatDate(new Date(year, month, date - 2));
      break;
    default:
      resultDate = formatDate(new Date(year, month, date));
      break;
  }

  return resultDate;
}


/**
 * 拆解日期(月/日/時/分)
 * @param date
 */
export function dismantleDate(date) {
  const _month = ('0' + (date.getMonth() + 1)).slice(-2);
  const _date = ('0' + date.getDate()).slice(-2);
  const _hours = ('0' + date.getHours()).slice(-2);
  const _minutes = ('0' + date.getMinutes()).slice(-2);
  return {
    '_month': _month, '_date': _date,
    '_hours': _hours, '_minutes': _minutes
  };
}
