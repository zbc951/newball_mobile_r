interface IDefault {
  LANG: string;
  BALL: string;
  TYPE: number;
  MIN_BET: number;
  isCashVer: boolean;
  SERVER_PATH: string;
  CHAT_SERVER: string;
  CHAT_SERVER_HTTPS: string;
  CHAT_SERVER_TYPE: string;
  VIDEO_PATH: string;
  MOVIE_PATH: string;
  HAS_MOVIE: boolean;
  HAS_RULE: boolean;
  isCN: boolean;
  hasPD: boolean;
  isPick8Enable: boolean;
  isPick8Open: boolean;
  LimitTypes: Array<string>;
  liveST: string;
  VIDEO_PATH_leisu: string;
  VIDEO_leisu: boolean;
  HKO:boolean;//香港賠率
  NIGHT_MODE: boolean; //夜間模式
  BEGINNER: boolean;//新手版-專業版
  LENGHT: boolean;//聯盟-時間-排序

  VIDEO_PATH_leisu_1: string;
  VIDEO_PATH_leisu_2: string;
}
interface IDevice {
  mobile: boolean;
  tablet: boolean;
}

declare const _DEFAULT: IDefault;
declare const _DEVICE: IDevice;

export const DEFAULT: IDefault = _DEFAULT;
export const DEVICE: IDevice = _DEVICE;
export const RouterPath = {
  teach: ['/teach'],
  lobby: ['/lobby'],
  live: ['/live'],
  info: ['/info'],
  user: ['/user'],
  report: ['/report'],
  more: {
    billboard: ['/more', 'billboard'],
    feedback: ['/more', 'feedback'],
    credit: ['/more', 'credit'],
    setting: ['/more', 'setting'],
    rule: ['/more', 'rule'],
  },
};
