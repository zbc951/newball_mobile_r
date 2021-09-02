export enum Odds {
  R = 'R',
  OU = 'OU',
  EO = 'EO',
  M = 'M',
  '2R' = '2R',
  R_1 = 'R_1',
  OU_1 = 'OU_1',
  EO_1 = 'EO_1',
  R_2 = 'R_2',
  OU_2 = 'OU_2',
  EO_2 = 'EO_2'
}

export interface IOddsType<T> {
  R?: T;
  OU?: T;
  EO?: T;
  M?: T;
  '2R'?: T;
  R_1?: T;
  OU_1?: T;
  EO_1?: T;
  R_2?: T;
  OU_2?: T;
  EO_2?: T
}
