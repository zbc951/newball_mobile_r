export enum BetResCase {
  success = 'success',
  updateHead = 'updateHead',
  updateOdds = 'updateOdds',
  pleaseCheck = 'pleaseCheck',
  others = 'others',
  totalError = 'totalError',
  noOid = 'noOid'
}

export interface IBetSuccessFile {
  gold: number | string;
  estGold: number | string;
  detail: any;
  betId: number;
  betType: any;
  time: string;
  gameDetail: any;
  ball: string;
  betTypeOrg: string;
}


export interface IbetRes {
  case: BetResCase;
  file: any | IBetSuccessFile;
}
