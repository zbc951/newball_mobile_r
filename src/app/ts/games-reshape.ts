import { Ball, BallType } from '@app/ts/ball';
import { Odds } from '@app/ts/odds';
import { IHandicap, ITeamInfo, IGame } from '@app/ts/game';
import { DEVICE } from '@app/app.config';

class BallOddsType extends BallType<Odds[]> { }
//各球種開放玩法資料
const ballOddsType: BallOddsType = {
  FT: [
    Odds.R, Odds.OU, Odds.EO, Odds.M,
    Odds.R_1, Odds.OU_1, Odds.EO_1
  ],
  // 籃球類
  BK: [
    Odds.R, Odds.OU, Odds.EO, Odds.M,
    Odds.R_1, Odds.OU_1, Odds.EO_1,
    Odds.R_2, Odds.OU_2, Odds.EO_2
  ],
  WB: [
    Odds.R, Odds.OU, Odds.EO, Odds.M,
    Odds.R_1, Odds.OU_1, Odds.EO_1
  ],
  // 棒球類
  BS: [
    Odds.R, Odds.OU, Odds['2R'], Odds.M,
    Odds.R_1, Odds.OU_1
  ],
  JB: [
    Odds.R, Odds.OU,
    Odds.R_1, Odds.OU_1
  ],
  CB: [
    Odds.R, Odds.OU,
    Odds.R_1, Odds.OU_1
  ],
  KB: [
    Odds.R, Odds.OU,
    Odds.R_1, Odds.OU_1
  ],
  //
  AF: [
    Odds.R, Odds.OU, Odds.EO, Odds.M,
    Odds.R_1, Odds.OU_1, Odds.EO_1
  ],
  TN: [
    Odds.R, Odds.OU, Odds.EO
  ],
  // 單場類
  LO: [
    Odds.OU, Odds.EO
  ],
  GD: [
    Odds.OU, Odds.EO
  ],
  ST: [
    Odds.OU, Odds.EO
  ],
  //
  EB: [
    Odds.R, Odds.OU
  ],
  //
  OTHERS: [
    Odds.R, Odds.OU, Odds.EO, Odds.M,
    Odds.R_1, Odds.OU_1, Odds.EO_1,
    Odds.R_2, Odds.OU_2, Odds.EO_2
  ],
};


function setHandicaps(oddsType: Odds[], handicaps: IHandicap[]): IHandicap[] {
  let newHandicaps;
  if (DEVICE.mobile) {
    newHandicaps = handicaps.filter(handicap => !!handicap.odds_H);
  } else {
    newHandicaps = handicaps.filter(handicap =>
      oddsType.indexOf(handicap.type) > -1
    );
  }

  return newHandicaps;
}
function setVideoID(a5, ball: Ball) {

  if (!!!Number(a5)) { return; }

  if (
    ball !== Ball.BK &&
    ball !== Ball.JB &&
    ball !== Ball.BS) { return; }

  const video: string = Number(a5) < 10 ? '0' + a5 : a5;

  let liveFile: string;
  let videoID: string;

  switch (ball) {
    case Ball.BK: case Ball.BS:
      liveFile = 'us'
      // if (Number(video) < 10) {
        videoID = liveFile + video;
      // }
      break;
    case Ball.JB:
      liveFile = 'jp'
      // if (Number(video) < 6) {
        videoID = liveFile + video;
      // }
      break;
    default:
      break;
  }
  return videoID;
}

export const reshapeGame = (ball: Ball) => (game): IGame => {
  const oddsType: Odds[] = ballOddsType[ball] || ballOddsType.OTHERS;
  const time = moment(game.c + 'T' + game.d + ':00').add(12, 'H');
  const isSecondHalf = !!game.l_2 || !!game.o_2 || game.q_2;
  return {
    date: time.format('YYYY-MM-DD'),
    time: time.format('H:mm'),
    ball: ball,
    league: game.eName || game.en,
    leagueID: game.e,
    gameID: game.b,
    videoID: setVideoID(game.a5, ball),
    gamePassTime: undefined,
    picthers: game.picthers || {},
    hasScoreData: false,
    isOpen: game.x === 'Y',
    location:game.b0,
    teamInfo: {
      gameID: game.b,
      gameID1: game.gameID1,
      gameID2: game.gameID2,
      league: game.eName || game.en,
      serial_H: game.h,
      serial_C: game.i,
      nameID_H: game.g,
      nameID_C: game.f,
      name_H: game.gName || game.gn,
      name_C: game.fName || game.fn,
      score_H: game.c1,
      score_C: game.c2,
    } as ITeamInfo,
    handicaps: setHandicaps(oddsType, [
      {
        type: Odds.R,
        odds_H: game.l,
        odds_C: game.m,
        side_H: 'H',
        side_C: 'C',
        head: game.k,
        strong: game.j === 'H' ? 'H' : 'C'
      },
      {
        type: Odds.OU,
        odds_H: game.o,
        odds_C: game.p,
        side_H: 'H',
        side_C: 'C',
        head: game.n,
        strong: 'H'
      },
      {
        type: Odds.EO,
        odds_H: game.q,
        odds_C: game.r,
        side_H: 'ODD',
        side_C: 'EVEN',
      },
      {
        type: Odds.M,
        odds_H: game.u,
        odds_C: game.v,
        odds_N: game.w,
        side_H: 'H',
        side_C: 'C',
        side_N: 'N',
      },
      {
        type: Odds['2R'],
        odds_H: game.a0,
        odds_C: game.a1,
        side_H: 'H',
        side_C: 'C',
        head: '1.5',
        strong: game.j === 'H' ? 'H' : 'C'
      },
      {
        type: isSecondHalf ? Odds.R_2 : Odds.R_1,
        odds_H: isSecondHalf ? game.l_2 : game.l_1,
        odds_C: isSecondHalf ? game.m_2 : game.m_1,
        side_H: 'H',
        side_C: 'C',
        head: isSecondHalf ? game.k_2 : game.k_1,
        strong: isSecondHalf ? game.j_2 : game.j_1 === 'H' ? 'H' : 'C'
      },
      {
        type: isSecondHalf ? Odds.OU_2 : Odds.OU_1,
        odds_H: isSecondHalf ? game.o_2 : game.o_1,
        odds_C: isSecondHalf ? game.p_2 : game.p_1,
        side_H: 'H',
        side_C: 'C',
        head: isSecondHalf ? game.n_2 : game.n_1,
        strong: 'H'
      },
      {
        type: isSecondHalf ? Odds.EO_2 : Odds.EO_1,
        odds_H: isSecondHalf ? game.q_2 : game.q_1,
        odds_C: isSecondHalf ? game.r_2 : game.r_1,
        side_H: 'ODD',
        side_C: 'EVEN',
      }
    ])
  };
}
