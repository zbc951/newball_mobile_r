import { Odds } from '@app/ts/odds';
import { Ball } from '@app/ts/ball';

export function isOU(oddsType) {
  if (
    oddsType === Odds.OU ||
    oddsType === Odds.OU_1 ||
    oddsType === Odds.OU_2
  ) { return true; }
  return false;
}

export function isFT(ball: Ball) {
  if (ball === Ball.FT) {
    return true;
  }
  return false;
}

export function isEO(oddsType) {
  if (
    oddsType === Odds.EO ||
    oddsType === Odds.EO_1 ||
    oddsType === Odds.EO_2
  ) { return true; }
  return false;
}
