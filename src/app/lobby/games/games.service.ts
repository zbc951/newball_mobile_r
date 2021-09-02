// Angular
import { Injectable } from '@angular/core';
// App
import { Play } from '@app/ts/play';
import { Ball } from '@app/ts/ball';
import { reshapeGame } from '@app/ts/games-reshape';
import { IGamesFile, IGame } from '@app/ts/game';
import { combineFirstHalf, combineSecondHalf, doCombine } from '@app/ts/combine-half';
// Service
import { ApiService } from '@service/api.service';
import { UidStatusService } from '@service/status-uid.service';
import { NameChartService } from '@service/name-chart.service';
import { BallStatusService } from '@service/status-ball.service';
import { ScoreService, IScore } from '@app/service/score.service';
// Lobby
import { GamesStoreService } from './games-store.service';
import { ConfigSetService } from '@app/service/config-set.service';
import { collect, allSearchCollectDB } from '../search-collect';
// RxJS
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/zip';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/let';
// lib
import { objCopy } from 'lib/helper';


@Injectable()
export class GamesService {

  private uid: string = this.uidStatus.uid;

  constructor(
    private api: ApiService,
    private ballStatus: BallStatusService,
    private uidStatus: UidStatusService,
    private scoreService: ScoreService,
    private gameStore: GamesStoreService,
    private configSet: ConfigSetService,
    private nameChart: NameChartService,
  ) { }
  /**
   * 取得賽事資料
   * @param play 玩法 (單式, 滾球, 過關)
   * @param ball 球種
   * @param showPC 是否顯示讀取圈
   */
  private gameServer(play: Play | string, ball: Ball, showPC = false) {
    const req = { uid: this.uid, gtype: ball, rtype: play };
    return this.api.postServer(100, req, showPC).map(res => res.ret['GameData']);
  }
  /**
   * 取得波膽資料
   * @param ball 球種
   * @param showPC 是否顯示讀取圈
   */
  private gameServerCRS(ball, showPC = false) {
    if (['FT', 'EF'].indexOf(ball) < 0) {//目前只有世界盃跟足球有波膽
      return Observable.of('');
    }
    const req = { uid: this.uid, gtype: ball, lang: this.configSet.lang};
    return this.api.postServer(116, req, showPC).map(res => res.ret);
  }
  /**
   * 取得上下半場資料
   * @param nowPlay 玩法
   * @param ball 球種
   * @param showPC 是否顯示讀取圈
   */
  private gameServerHR(nowPlay: Play, ball: Ball, showPC = false) {

    let observableFileHR: Observable<any> = Observable.of('');
    if (nowPlay === Play.grounder) { //走地
      return Observable.of('');
    }
    if (nowPlay !== Play.mixing) { //原盤
      switch (ball) {
        case Ball.FT: case Ball.BK:
        case Ball.BS: case Ball.CB: case Ball.JB: case Ball.KB:
        case Ball.EF: case Ball.WB:
          observableFileHR = this.gameServer('HR', ball, showPC);
          break;
        default:
          observableFileHR = Observable.of('');
          break;
      }
    }
    return observableFileHR;
  }
  /**
   * 取得已經分析過後的賽事資料
   * @param play 玩法
   * @param ball 球種
   * @param showPC 是否顯示讀取圈
   */
  getGameFile(play: Play, ball: Ball, showPC = false): Observable<IGamesFile[]> {
    // const storeFile = this.gameStore.get(play, ball);
    const GameServer$ = this.gameServer(play, ball, showPC); //主要的賽事資料
    const GameServerHR$ = this.gameServerHR(play, ball, showPC); //上下半賽事資料
    const GameServerCRS$ = this.gameServerCRS(ball, showPC); //波膽賽事資料
    const GameScore$ = this.scoreService.getScore([ball], []); //取得比分
    return Observable.forkJoin(GameServer$, GameServerHR$, GameServerCRS$, GameScore$)
      .switchMap(_serverData => {
        let ServerData = _serverData[0] || {};
        let ServerDataHR = _serverData[1] || {};
        const ServerDataCRS = _serverData[2] || {};
        const ScoreData = (_serverData[3] || {})[ball];
        ServerData = this.AddOnlyHRGames(ServerData, ServerDataHR); //將只有開上下半場(沒有圓盤資料)的賽事加入賽事列表中
        // 走地需要合併自帶 L73 (上半)
        let ServerDataL73 = {};
        if (ServerData && ServerData['L73']) { //走地的上半資料放在L73內
          if (play === Play.grounder) {
            ServerDataL73 = objCopy(ServerData['L73']);
          }
          delete ServerData['L73'];
        } 
        if (ServerData && ServerData['L74']) { //下半資料會單純開一場新的出來 所以無視
          delete ServerData['L74'];
        }
        //分析並合併賽事資料
        const buildGamesList = Obs => Obs.concatMap(GamesObj => {
          const Games = Object.values(GamesObj);
          return Observable.from(Games)
            .filter(this.isGameOpen) // 過濾未開盤賽事
            .concatMap(this.combineNameAsync(ball)) // 將賽事名稱合併至賽事內
            .filter(this.isNameExist) // 過濾沒有對應到名稱的賽事及聯盟
            .map(this.combineL73(ServerDataL73)) // 將走地上半資料合併進賽事資料內
            .map(this.combineHR(ServerDataHR)) // 合併上下半資料
            .map(reshapeGame(ball)) //格式化賽事資料
            .map(this.combinCRS(ServerDataCRS)) //合併波膽資料
            .map(this.combinScore(ScoreData)) //合併比分資料
            .do(collect(play, ball)) //更新賽事搜尋用的資料
            .toArray()
            .map(this.sortGame); //賽事排序
        });

        const LeagueList$ = 
          Observable.from(Object.keys(ServerData));
        const GamesList$ =
          Observable.from(Object.values(ServerData)).let(buildGamesList);

        const buildLeagueItem = (league, games) => {
          if (games.length === 0) { return; }
          return { lid: league.split('L')[1], league: games[0].league, games: games }
        };
        const LeagueItem$ =
          Observable.zip(LeagueList$, GamesList$, buildLeagueItem).filter(f => !!f);

        return LeagueItem$;
      })
      .toArray()
      // .do(this.gameStore.save(play, ball));

  }
  /**
   * 將只有開上下半的賽事(原盤中找不到)加入列表中
   */
  private AddOnlyHRGames = function(ServerData, ServerDataHR) {
    let lKeys = Object.keys(ServerDataHR);
    lKeys.forEach(lkey => {
      let lData = ServerDataHR[lkey];
      let gKeys = Object.keys(lData);
      gKeys.filter(gkey => lData[gkey].x === 'Y').forEach(gkey => {
        let gData = lData[gkey];
        let gid = gData.b5 && gData.b5.split('_')[0];
        if (ServerData[lkey]) { //有在圓盤找到該聯盟
          if (!ServerData[lkey]['G' + gid]) { //沒在圓盤該聯盟找到該賽事
            ServerData[lkey]['G' + gid] = {
              a: gData.a,
              b: gid,
              c: gData.c,
              d: gData.d,
              e: gData.e,
              f: gData.f,
              g: gData.g,
              h: gData.h,
              i: gData.i,
              j: gData.j,
              x: 'Y'
            }
          }
        } else { //沒在圓盤找到該聯盟
          ServerData[lkey] = {};
          ServerData[lkey]['G' + gid] = {
            a: gData.a,
            b: gid,
            c: gData.c,
            d: gData.d,
            e: gData.e,
            f: gData.f,
            g: gData.g,
            h: gData.h,
            i: gData.i,
            j: gData.j,
            x: 'Y'
          }
        }
      });
    })
    return ServerData;
  }
  // 同個聯盟裡，主隊相同名稱排序 → 時間排序
  private sortGame = (games: IGame[]) => {
    let newGames: IGame[] = [];
    let compareSide: string = 'name_C';
    const collectTeam: { [key: string]: IGame[] } = {};
    if (this.ballStatus.ball === Ball.FT) { compareSide = 'name_H'; }

    for (let i = 0, l = games.length; i < l; i++) {
      const game = games[i];
      const nameTeam = (game.teamInfo[compareSide] && game.teamInfo[compareSide].split) ? game.teamInfo[compareSide].split('-')[0].trim() : [];
      if (!collectTeam[nameTeam]) {
        collectTeam[nameTeam] = [];
      }
      collectTeam[nameTeam].push(game);
    }
    const collectArr = Object.values(collectTeam);
    for (let i = 0, l = collectArr.length; i < l; i++) {
      const collect = collectArr[i];
      newGames = [...newGames, ...collect];
    }
    return newGames;
  }
  // 賽事是否開盤
  private isGameOpen = (game) => {
    return game.x === 'Y'
  }
  // 賽事是否有對應到名稱
  private isNameExist = (game) => {
    return !!game.gName || !!game.fName;
  }
  // 將賽事內的名稱做套用
  private combineName(game, leagueName, teamNameItem, picthers) {
    game['eName'] = leagueName;
    game['gName'] = teamNameItem.name_H;
    game['fName'] = teamNameItem.name_C;
    game['picthers'] = picthers;
    return game;
  }
  // 比對賽事內對應的名稱
  private combineNameSync = (ball: Ball) => (game) => {

    const leagueName =
      this.nameChart.transLeagueSync(ball, game.e);
    const teamNameItem =
      this.nameChart.transTeamSync(ball, { ID_H: game.g, ID_C: game.f })
    const picthers = 
      this.nameChart.transPicthersSync(ball, {picther_H: game.a9, picther_C: game.a8});
    return this.combineName(game, leagueName, teamNameItem, picthers);
  }
  // 比對賽事內對應的名稱

  private combineNameAsync = (ball: Ball) => async (game) => {
    const leagueName =
      await this.nameChart.transLeagueAsync(ball, game.e);
    const teamNameItem =
      await this.nameChart.transTeamAsync(ball, { ID_H: game.g, ID_C: game.f })
    const picthers = 
      await this.nameChart.transPicthersAsync(ball, {picther_H: game.a9, picther_C: game.a8});
    return this.combineName(game, leagueName, teamNameItem, picthers);
  }
  // 合併上半賽事
  private combineL73 = (ServerDataL73) => (game) => {
    const REListL73 = Object.values(ServerDataL73);
    if (!!!REListL73 || REListL73.length === 0) { return game; }
    for (let i = 0, l = REListL73.length; i < l; i++) {
      let REItemL73 = REListL73[i];

      if (game.b === Number(REItemL73['b5'].split('_')[0])) {
        game = combineFirstHalf(game, REItemL73);
        game['gameID1'] = REItemL73['b'];
        
        break;
      } 
      // else {
      //   const ball = this.ballStatus.ball;
      //   REItemL73 = this.combineNameSync(ball)(REItemL73);
      //   if (
      //     this.isNameExist(REItemL73) &&
      //     REItemL73['fName'].slice(-2) === game.fName.slice(-2) &&
      //     REItemL73['gName'].slice(-2) === game.gName.slice(-2)
      //   ) {
      //     game = combineFirstHalf(game, REItemL73);
      //     game['gameID1'] = REItemL73['b'];
      //     break;
      //   }
      // }
    }
    return game;
  }
  // 合併波膽賽事
  private combinCRS = (ServerCRS) => (game) => {
    if (ServerCRS[game.teamInfo.gameID]) {
      game.PD = ServerCRS[game.teamInfo.gameID].PD;
    }
    return game;
  }
  // 合併比分
  private combinScore = (ScoreData) => (game) => {
      game.gamePassTime = '';

    if (ScoreData && ScoreData[game.gameID]) {
      game.hasScoreData = true;
      game.teamInfo.score_H = ScoreData[game.gameID].ht;
      game.teamInfo.score_C = ScoreData[game.gameID].ct;
      //game.gamePassTime = Math.random();
       game.gamePassTime = (ScoreData[game.gameID].rt == 'NoData')?'':ScoreData[game.gameID].rt;
    }
    return game;
  }
  // 合併上下半賽事
  private combineHR = (ServerDataHR) => (game) => {

    const HR = ServerDataHR[`L${game.e}`];

    if (!!!HR) { return game; }

    const keys = Object.keys(HR);
    for (let i = 0, l = keys.length; i < l; i++) {

      const gameHR = HR[keys[i]];
      if (!!!this.isGameOpen(gameHR)) { continue; }

      const spiltHR_b5 = gameHR.b5.split('_');
      const HR_id = Number(spiltHR_b5[0]);
      const HR_half = Number(spiltHR_b5[1]);
      if (Number(game.b) === HR_id) {
        game = doCombine(HR_half, game, gameHR);
        game['gameID' + HR_half] = gameHR.b;
        break;
      }
      // else if ( 
      //   this.isNameExist(gameHR) &&
      //   gameHR.fName.slice(-2) === game.fName.slice(-2) &&
      //   gameHR.gName.slice(-2) === game.gName.slice(-2)
      // ) {
      //   game = doCombine(HR_half, game, gameHR);
      //   game['gameID' + HR_half] = gameHR.b;
      //   break;
      // }

    }

    return game;
  }

}
