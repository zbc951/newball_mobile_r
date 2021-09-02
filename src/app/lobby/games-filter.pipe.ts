// Angular
import { Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
// App
import { IGamesFile, IGame } from '@app/ts/game';
import { Observable } from 'rxjs/Observable';
// Lobby
import { GamesBasis } from '@lobby/games-basis';
import { BallQuantityService } from '@app/service/ball-quantity.service';
import { Ball } from '@app/ts/ball';
import { BallStatusService } from '@app/service/status-ball.service';
import { objCopy } from 'lib/helper';

@Pipe({
  name: 'gamesFilter'
})
export class GamesFilterPipe implements PipeTransform {

  constructor(private ballStatus: BallStatusService) { }

  transform(
    gamesFile: IGamesFile[],
    searchDate: any,
    searchLeague: string[] = [],
    useBall: Ball,
    searchTeam: any,
  ): IGamesFile[] {
 
    gamesFile = gamesFile.map(league => { //過濾沒有對應到隊伍名稱的賽事
      if (['GD', 'ST', 'LO'].indexOf(useBall) >= 0) { //沒有對戰隊伍的球種 (只確認主隊格
        league.games = league.games.filter(game => (game.teamInfo.name_H && game.teamInfo.name_H.length > 0));
      } else { //有對戰隊伍的球種 確認兩隊的名稱
        league.games = league.games.filter(game => (game.teamInfo.name_C && game.teamInfo.name_C.length > 0) && (game.teamInfo.name_H && game.teamInfo.name_H.length > 0));
      }
      return league;
    })
    //過濾沒有對應到聯盟名稱的聯盟
    gamesFile = gamesFile.filter(league => (league.league && league.league.length > 0) && league.games.length > 0);
   
    if (!searchDate && searchLeague.length == 0 && searchTeam == '') { // 沒有設定賽事搜尋資料 (不再進行過濾)
      return gamesFile;
    }

    let newGamesFile = gamesFile.filter(game => true);

    if (searchLeague.length > 0) { //過濾聯盟
      newGamesFile = newGamesFile.filter(game => this.has(searchLeague, game.league));
    }
    if (searchDate) { //過濾日期
      newGamesFile = newGamesFile.map(game => {
        return {
          lid: game.lid,
          league: game.league,
          games: game.games.filter(g => g.date == searchDate.date)
        }
      });
    }
    if (searchTeam) { //過濾隊伍
      newGamesFile = newGamesFile.map(game => {
        return {
          lid: game.lid,
          league: game.league,
          games: game.games.filter(g => g.teamInfo.name_C.match(searchTeam) != null || g.teamInfo.name_H.match(searchTeam) != null)
        }
      });
    }
    newGamesFile = newGamesFile.filter(game => game.games.length > 0); //過濾掉沒有賽事的聯盟
    return newGamesFile;
    
  }

  has(sl, key) {
    for(let i = 0; i < sl.length; i++) {
      if (sl[i] === key) return true;
    }
    return false;
  }
}



@Pipe({
  name: 'gamesSort'
})
export class gamesSortPipe implements PipeTransform {

  constructor() { }

  transform(
    gamesFile: IGamesFile[],
    orderLeague:Boolean,
  ): IGamesFile[]  {
    if(orderLeague || gamesFile.length == 0){
      return gamesFile;
    }
    let newGamesFile = gamesFile.filter(game => true);
    let NEWgames =[];
    let data = [];
    let i =0;
    //攤平
    newGamesFile.forEach(e1 => {
      e1.games.forEach(e2 => {
        data.push(e2);
      });
    });
    //ARR排序時間
    data.sort(function(a, b) {
      return Date.parse((a.date + " " + a.time).replace(/-/g, '/')) - Date.parse((b.date + " " + b.time).replace(/-/g, '/'));
    });
    //在排版一次
    data.forEach((val,key) => {
      if(NEWgames.length == 0 ){
        NEWgames.push(
          {
            lid: val.leagueID,
            league: val.league,
            games: [val]
          }
        );     
      
      }else{
        if(  NEWgames[i].lid != val.leagueID){
          NEWgames.push(
            {
              lid: val.leagueID,
              league: val.league,
              games: [val]
            }
          );   
          i++;
        }
        else{
          NEWgames[i].games.push(val);
        }
      }

     
    });
    return NEWgames;
  }
}