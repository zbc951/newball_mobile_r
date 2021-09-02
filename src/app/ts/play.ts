export enum Play {
  single = 'R',
  grounder = 'RE',
  mixing = 'MPR',
  all = 'all',
}

export interface IPlayType<T> {
  R: T;
  RE: T;
  MPR: T;
}

export class PlayType<T> implements IPlayType<T> {
  R: T;
  RE: T;
  MPR: T;
  constructor(single: T, grounder: T, mixing: T) {
    this.R = single;
    this.RE = grounder;
    this.MPR = mixing;
  }
}

export const playUpdateTime: PlayType<number>
  = new PlayType(60, 30, 60);
