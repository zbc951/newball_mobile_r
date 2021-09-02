export enum Ball {
  HT = 'HT', // 我的最愛
  FT = 'FT', // 足球
  BK = 'BK', // 美國職籃
  BH = 'BH', // 美國職籃 半場
  BQ = 'BQ', // 美國職籃 四節
  WB = 'WB', // 其他籃球
  BS = 'BS', // 美國職棒
  BF = 'BF', // 美國職棒 半場
  JB = 'JB', // 日本職棒
  JF = 'JF', // 日本職棒 半場
  CB = 'CB', // 中華職棒
  CF = 'CF', // 中華職棒 半場
  KB = 'KB', // 其他棒球
  AF = 'AF', // 美式足球
  TN = 'TN', // 網球
  LO = 'LO', // 彩球
  GD = 'GD', // 賽馬賽狗
  ST = 'ST', // 指數
  EB = 'EB', // 電競
  BL = 'BL', // 撞球
  EF = 'EF', // 世界盃
  EK = 'EK', // 高爾夫
  HB = 'HB', // 手球
  IB = 'IB', // 冰球
  PO = 'PO', // 拳擊
  VB = 'VB'  // 排球
}

export interface IBallType<T> {
  HT?: T;
  FT?: T;
  BK?: T;
  BH?: T;
  BQ?: T;
  WB?: T;
  BS?: T;
  BF?: T;
  JB?: T;
  JF?: T;
  CB?: T;
  CF?: T;
  KB?: T;
  AF?: T;
  TN?: T;
  LO?: T;
  GD?: T;
  ST?: T;
  EB?: T;
  BL?: T;
  EF?: T;
  EK?: T;
  HB?: T;
  IB?: T;
  PO?: T;
  VB?: T;
  OTHERS?: T;
}

export class BallType<T> implements IBallType<T>  {
  HT?: T;
  FT?: T;
  BK?: T;
  BH?: T;
  BQ?: T;
  WB?: T;
  BS?: T;
  BF?: T;
  JB?: T;
  JF?: T;
  CB?: T;
  CF?: T;
  KB?: T;
  AF?: T;
  TN?: T;
  LO?: T;
  GD?: T;
  ST?: T;
  EB?: T;
  BL?: T;
  EF?: T;
  EK?: T;
  HB?: T;
  IB?: T;
  PO?: T;
  VB?: T;
  OTHERS?: T;
}

export interface IAppBalls {
  content: any;
  value: Ball;
  icon1: string;
  icon2?: string;
  count?: number | string;
  setDefault: boolean;
  titleAry: Array<string>;
  detailAry: Array<Array<string>>;
  REdetailAry: Array<Array<string>>;
  LiveDetailAry: Array<Array<string>>;
}

export const appBalls: IAppBalls[] = [
  //世界盃
  // {
  //   value: Ball.EF,
  //   setDefault: true,
  //   icon1: '',
  //   icon2: 'EF',
  //   titleAry: ['R', 'OU', 'R_1', 'OU_1'],
  //   detailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
  //   REdetailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
  //   LiveDetailAry: [['R', 'OU', 'EO', 'M'], ['R_1', 'OU_1', 'EO_1', ''], ['R_2', 'OU_2', 'EO_2', '']]
  // },
  //足球
  {
    value: Ball.FT,
    setDefault: true,
    icon1: 'soccer',
    icon2: 'soccer',
    titleAry: ['R', 'OU', 'R_1', 'OU_1'],
    detailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    REdetailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    LiveDetailAry: [['R', 'OU', 'EO', 'M'], ['R_1', 'OU_1', 'EO_1', ''], ['R_2', 'OU_2', 'EO_2', '']],
    content:{ALL: 0, RE: 0, MPR: 0}
  },
  //美國職籃
  {
    value: Ball.BK,
    setDefault: true,
    icon1: 'basketball',
    icon2: 'basketball',
    titleAry: ['R', 'OU', 'R_1', 'OU_1'],
    detailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    REdetailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    LiveDetailAry: [['R', 'OU', 'EO', 'M'], ['R_1', 'OU_1', 'EO_1', ''], ['R_2', 'OU_2', 'EO_2', '']],
    content:{ALL: 0, RE: 0, MPR: 0}
  },
  //其他籃球
  {
    value: Ball.WB,
    setDefault: true,
    icon1: 'basketball',
    icon2: 'basketball',
    titleAry: ['R', 'OU', 'R_1', 'OU_1'],
    detailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    REdetailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    LiveDetailAry: [['R', 'OU', 'EO', 'M'], ['R_1', 'OU_1', 'EO_1', ''], ['R_2', 'OU_2', 'EO_2', '']],
    content:{ALL: 0, RE: 0, MPR: 0}
  },
  //美國職棒
  {
    value: Ball.BS,
    setDefault: true,
    icon1: 'basball',
    icon2: 'baseball',
    titleAry: ['R', 'OU', 'R_1', 'OU_1'],
    detailAry: [['M', '2R', '', ''], ['', '', '', '']],
    REdetailAry: [['', '', '', ''], ['', '', '', '']],
    LiveDetailAry: [['R', 'OU', '', ''], ['R_1', 'OU_1', '', '']],
    content:{ALL: 0, RE: 0, MPR: 0}
  },
  //中華職棒
  {
    value: Ball.CB,
    setDefault: true,
    icon1: 'basball',
    icon2: 'baseball',
    titleAry: ['R', 'OU', 'R_1', 'OU_1'],
    detailAry: [['M', '2R', '', ''], ['', '', '', '']],
    REdetailAry: [['', '', '', ''], ['', '', '', '']],
    LiveDetailAry: [['R', 'OU', '', ''], ['R_1', 'OU_1', '', '']],
    content:{ALL: 0, RE: 0, MPR: 0}
  },
  //日本職棒
  {
    value: Ball.JB,
    setDefault: true,
    icon1: 'basball',
    icon2: 'baseball',
    titleAry: ['R', 'OU', 'R_1', 'OU_1'],
    detailAry: [['M', '2R', '', ''], ['', '', '', '']],
    REdetailAry: [['', '', '', ''], ['', '', '', '']],
    LiveDetailAry: [['R', 'OU', '', ''], ['R_1', 'OU_1', '', '']],
    content:{ALL: 0, RE: 0, MPR: 0}
  },
  //其他棒球
  {
    value: Ball.KB,
    setDefault: true,
    icon1: 'basball',
    icon2: 'baseball',
    titleAry: ['R', 'OU', 'R_1', 'OU_1'],
    detailAry: [['M', '2R', '', ''], ['', '', '', '']],
    REdetailAry: [['', '', '', ''], ['', '', '', '']],
    LiveDetailAry: [['R', 'OU', '', ''], ['R_1', 'OU_1', '', '']],
    content:{ALL: 0, RE: 0, MPR: 0}
  },
  //美式足球
  {
    value: Ball.AF,
    setDefault: true,
    icon1: 'football',
    icon2: 'football',
    titleAry: ['R', 'OU', 'R_1', 'OU_1'],
    detailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    REdetailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    LiveDetailAry: [['R', 'OU', 'EO', 'M'], ['R_1', 'OU_1', 'EO_1', ''], ['R_2', 'OU_2', 'EO_2', '']],
    content:{ALL: 0, RE: 0, MPR: 0}
  },
  //賽馬賽狗
  {
    value: Ball.GD,
    setDefault: true,
    icon1: 'horse',
    icon2: 'horse_race',
    titleAry: ['OU', 'EO', '', ''],
    detailAry: [['', '', '', '']],
    REdetailAry: [['', '', '', '']],
    LiveDetailAry: [['OU', 'EO', '', '']],
    content:{ALL: 0, RE: 0, MPR: 0}
  },
  //電競
  {
    value: Ball.EB,
    setDefault: true,
    icon1: 'e_sport',
    icon2: 'esport',
    titleAry: ['R', 'OU', 'R_1', 'OU_1'],
    detailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    REdetailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    LiveDetailAry: [['R', 'OU', 'EO', 'M'], ['R_1', 'OU_1', 'EO_1', ''], ['R_2', 'OU_2', 'EO_2', '']],
    content:{ALL: 0, RE: 0, MPR: 0}
  },
  //指數
  {
    value: Ball.ST,
    setDefault: true,
    icon1: 'graph',
    icon2: 'temp',
    titleAry: ['OU', 'EO', '', ''],
    detailAry: [['', '', '', '']],
    REdetailAry: [['', '', '', '']],
    LiveDetailAry: [['OU', 'EO', '', '']],
    content:{ALL: 0, RE: 0, MPR: 0}
  },
  //彩球
  {
    value: Ball.LO,
    setDefault: true,
    icon1: 'color_ball',
    icon2: 'temp',
    titleAry: ['OU', 'EO', '', ''],
    detailAry: [['', '', '', '']],
    REdetailAry: [['', '', '', '']],
    LiveDetailAry: [['OU', 'EO', '', '']],
    content:{ALL: 0, RE: 0, MPR: 0}
  },
  //網球
  // {
  //   value: Ball.TN,
  //   setDefault: true,
  //   icon1: 'tennis',
  //   icon2: 'tennis',
  //   titleAry: ['R', 'OU', 'R_1', 'OU_1'],
  //   detailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
  //   REdetailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
  //   LiveDetailAry: [['R', 'OU', 'EO', 'M'], ['R_1', 'OU_1', 'EO_1', ''], ['R_2', 'OU_2', 'EO_2', '']]
  // },
  //撞球
  {
    value: Ball.BL,
    setDefault: false,
    icon1: 'snooker',
    icon2: 'snooker',
    titleAry: ['R', 'OU', 'R_1', 'OU_1'],
    detailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    REdetailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    LiveDetailAry: [['R', 'OU', 'EO', 'M'], ['R_1', 'OU_1', 'EO_1', ''], ['R_2', 'OU_2', 'EO_2', '']],
    content:{ALL: 0, RE: 0, MPR: 0}
  },
  //高爾夫
  {
    value: Ball.EK,
    setDefault: false,
    icon1: 'temp',
    icon2: 'temp',
    titleAry: ['R', 'OU', 'R_1', 'OU_1'],
    detailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    REdetailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    LiveDetailAry: [['R', 'OU', 'EO', 'M'], ['R_1', 'OU_1', 'EO_1', ''], ['R_2', 'OU_2', 'EO_2', '']],
    content:{ALL: 0, RE: 0, MPR: 0}
  },
  //手球
  {
    value: Ball.HB,
    setDefault: false,
    icon1: 'temp',
    icon2: 'temp',
    titleAry: ['R', 'OU', 'R_1', 'OU_1'],
    detailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    REdetailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    LiveDetailAry: [['R', 'OU', 'EO', 'M'], ['R_1', 'OU_1', 'EO_1', ''], ['R_2', 'OU_2', 'EO_2', '']],
    content:{ALL: 0, RE: 0, MPR: 0}
  },
  //冰球
  {
    value: Ball.IB,
    setDefault: true,
    icon1: 'ice_ball',
    icon2: 'ice_hockey',
    titleAry: ['R', 'OU', 'R_1', 'OU_1'],
    detailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    REdetailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    LiveDetailAry: [['R', 'OU', 'EO', 'M'], ['R_1', 'OU_1', 'EO_1', ''], ['R_2', 'OU_2', 'EO_2', '']],
    content:{ALL: 0, RE: 0, MPR: 0}
  },
  //拳擊
  {
    value: Ball.PO,
    setDefault: false,
    icon1: 'temp',
    icon2: 'temp',
    titleAry: ['R', 'OU', 'R_1', 'OU_1'],
    detailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    REdetailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    LiveDetailAry: [['R', 'OU', 'EO', 'M'], ['R_1', 'OU_1', 'EO_1', ''], ['R_2', 'OU_2', 'EO_2', '']],
    content:{ALL: 0, RE: 0, MPR: 0}
  },
  //排球
  {
    value: Ball.VB,
    setDefault: false,
    icon1: 'volleyball',
    icon2: 'volleyball',
    titleAry: ['R', 'OU', 'R_1', 'OU_1'],
    detailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    REdetailAry: [['EO', 'M', '', ''], ['EO_1', '', '', ''], ['R_2', 'OU_2', 'EO_2', '']],
    LiveDetailAry: [['R', 'OU', 'EO', 'M'], ['R_1', 'OU_1', 'EO_1', ''], ['R_2', 'OU_2', 'EO_2', '']],
    content:{ALL: 0, RE: 0, MPR: 0}
  }
];