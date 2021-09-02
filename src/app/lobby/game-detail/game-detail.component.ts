import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef,
  Input, ElementRef, ViewChild, OnChanges ,EventEmitter,Output
} from '@angular/core';
import { UnSubscribe } from 'lib/ng-component/unsubscribe';
import { ApiService } from '@service/api.service';
import { UidStatusService } from '@service/status-uid.service';
import { ConfigSetService } from '@app/service/config-set.service';
import { BetStatusService } from '@service/status-bet.service';
import { PlayStatusService } from '@service/status-play.service';
import { Play } from '@app/ts/play';
import { concatAll } from 'rxjs/operators';
import { SpecialPlayService } from '../special-play.service';
import { DialogStatusService } from '@app/service/status-dialog.service';
// Live
import { LiveService } from '@live/live.service';
// RxJS
import { Observable } from 'rxjs/Observable';
import { TransBet } from 'ts/translate-value';
import { DEFAULT } from '@app/app.config';
import { ILiveData } from 'ts/interface';
@Component({
  selector: 'game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameDetailComponent extends UnSubscribe implements OnInit, OnChanges {
  // 直播影片的位址 雷速
  VIDEO_PATH_leisu_1 = DEFAULT.VIDEO_PATH_leisu_1;
  // 直播影片的位址 雷速
  VIDEO_PATH_leisu_2 = DEFAULT.VIDEO_PATH_leisu_2;
  // 直播影片的位址
  VIDEO_PATH = DEFAULT.VIDEO_PATH;

  // 賽事資料
  @Input() gameData;
  // lobby callback
  @Input() toLobby: Function;
  // 投注種類 走地 圓盤 過關
  @Input() type;
  // 投注球種 
  @Input() ball;
  //改變 外面的mai
  @Output() SwitchCSS = new EventEmitter();

  playList = [
    {type:'ALL', list: ['M', 'R', 'OU', 'EO', '2R', 'R_1', 'OU_1', 'EO_1', 'R_2', 'OU_2', 'EO_2', 'PD'], data:[]},
    {type:'F', list: ['M', 'R', 'OU', 'EO', '2R'], data:[]},
    {type:'UD', list: ['R_1', 'OU_1', 'EO_1', 'R_2', 'OU_2', 'EO_2'], data:[]},
    {type:'PD', list: ['PD'], data:[]},
    {type:'SP', list: [], data:[]},
  ]
  Play = Play;
  // 是否顯示群組選項
  groupActive = false;
  // 目前選到的玩法種類
  selectedGroup = 'ALL';
  noHeadList = ['M', 'EO', 'EO_1', 'EO_2'];

  SPdata=[];
  // 目前語系
  private lang = this.configSet.lang;
  // 下注訊息語言包
  TransBet = TransBet[this.lang];
  //直播資料
  liveData: any= {};
  //直播頁換
  live_page :Boolean = false;

  Overfiltration:string='';
  
  constructor(
    private cd: ChangeDetectorRef,
    private api: ApiService,
    private uidStatus: UidStatusService,
    private configSet: ConfigSetService,
    private betStatus: BetStatusService,
    public playStatus: PlayStatusService,
    public SpecialPlay :SpecialPlayService,
    private dialog: DialogStatusService,
    private liveService: LiveService,
    ) {
    super();
  }

  ngOnInit() {
    console.log('inin', this.gameData);
    this.formatData();
    this.cd.markForCheck()
    //this.getSPdata();
   
    console.log(this.type);
    this.SpecialPlay.onUPdata(this.gameData.gameID,this.gameData.ball);

    this.SpecialPlay.SPdata$.subscribe((res) => {
      if(this.type == 'RE'){
        return;
      }
      this.SPdata = this.SortCS(res);
   
     // this.SPdata =res;
      this.cd.markForCheck();
      });
      this.getLiveData();
  }
  ngOnChanges() {
    // console.log('change', this.gameData);
    this.formatData();
    this.cd.markForCheck()
  }
  onClose() {
    this.SpecialPlay.closeUPdata();
    this.toLobby('close');
  }
  onUpdate() {
    this.toLobby('update');
    this.getLiveData();
  }
  formatData() {
    var mapping = {};
    this.gameData && this.gameData.handicaps && this.gameData.handicaps.forEach(play => {
      // 是否有球頭
      play.hasHead = this.noHeadList.indexOf(play.type) < 0;
      // 整理下注用資料
      var sideMapping = ['H','C','N'];
      sideMapping.forEach(side => {
        if (play['side_' + side]) {
          var tmp = {
            head: '',
            odd: '',
            side: play['side_' + side],
            strong: play['strong']
          };
          if (play['odds_' + side] !== 0) {
            tmp.head = play['head'];
            tmp.odd = play['odds_' + side];
          }
          play['bet_' + side] = tmp;
        }
      });

      mapping[play.type] = play;
    });
    if (this.gameData && this.gameData.PD && this.playStatus.play !== Play.mixing) {
      this.gameData.PD['type'] = 'PD';
      mapping['PD'] = this.gameData.PD;
    }
    this.playList.map(group => {
      group.data = [];
      group.list.forEach(play => {
        if (mapping[play]) {
          group.data.push(mapping[play]);
        }
      });
    });
    // console.log('after format ', this.gameData);
    this.groupActive = this.playList.filter(group => group.data.length > 0).length > 2;
  }
  nowGoup() {
    return this.playList.filter(group => group.type == this.selectedGroup)[0]['data'];
  }
  /**
   * 設定下注內容
   * @param handicap 賠率資料
   * @param play 投注玩法
   */
  setBet(handicap, play) {
    // console.log('setBet', this.gameData.teamInfo, handicap, play, this.type, this.ball)
    if (!handicap.odd) return;
    this.betStatus.setBet(this.gameData.teamInfo, handicap, play, this.type, this.ball);
  }
  /**
   * 取得波膽陣列
   */
  getBetPDAry() {
    let maxPoint = 4;
    let retAry = [[], [], []];
    for (let h = 0; h <= maxPoint; h++) {
      for(let c = 0; c <= maxPoint; c++) {
        let pushIndex = 0;
        if (h > c) { pushIndex = 0 }
        else if(h < c) { pushIndex = 2 }
        else { pushIndex = 1 }
        retAry[pushIndex].push({
          point: `${h}:${c}`,
          rioratio: (this.gameData && this.gameData.PD[`H${h}C${c}`]) ? this.gameData.PD[`H${h}C${c}`].ioratio : 0,
          type: `H${h}C${c}`,
          h:h,
          c:c
        })
      }
    }
    retAry[2].sort((b,a) => (b.c*10+b.h) - (a.c*10+a.h));
    let rAry = [];
    for (let i = 0; i < retAry[0].length; i++) {
      if (retAry[1][i]){
        rAry.push([retAry[0][i], retAry[1][i], retAry[2][i]])
      } else {
        rAry.push([retAry[0][i], {}, retAry[2][i]])
      }
    }
    // console.log('PD', rAry);
    return rAry;
  }
  /**
   * 設定波膽下注內容
   * @param teamInfo 賽事隊伍資料
   * @param point 
   */
  setBetPD(teamInfo, point, active) {
    if (point && point.rioratio && point.rioratio >= 0) {
      this.betStatus.setBet(teamInfo, {
        odd: point.rioratio,
        side: point.type,
        head: point.type
      }, 'PD');
    }
  }
  /**
   * 過關時被選到的玩法會顯示反白 回傳該玩法是否被選中
   * @param gameID 
   * @param oddsType 
   * @param side 
   */
  isActive(oddsType, side) {
    // console.log(oddsType, side);
    const idx = this.betStatus.mixingBetFiles.findIndex(betFile =>
      betFile.gameID === this.gameData.gameID && betFile.oddsType === oddsType && betFile.side === side
    )
    return idx !== -1;
  }
  /**
   * 特殊玩法
   */
  getSPdata(){
    const req = { uid: this.uidStatus.uid, lang: this.configSet.lang ,gid : this.gameData.gameID ,gtype: this.gameData.ball};
    this.api.postServer(130, req)
      .map(res => res.ret)
      .subscribe(data => {
    
        console.log('SPdata',data);
      this.cd.markForCheck();
      });
  }
  /**
   * 下注
   * @param _list 
   * @param _play 
   */
  newBet(_list,_play){
    if(!_list.zh || _list.ioratio == '' || !_list.type){
      this.dialog.alert(this.TransBet['Not_open']);
      return;  
    }
    this.betStatus.neWsetBet(this.gameData.gameID, this.gameData.ball,this.gameData.teamInfo,_list,_play);
  }
  /**過濾隊不到語系的玩法 不開放 */
  OpenPlay(_name){
    if(_name.indexOf('special.') >= 0 ){
      console.log('隊伍語系無對應:'+_name);
      return false;
    }

    return true;
  }
  /**
   * 排序波膽
   * @param _data 資料
   */
  private SortCS(_data){
    var _key=['CS','1H_CS','2H_CS','CCS'];
    var _seat={
        '1-0':[0,0],
        '0-0':[0,1],
        '0-1':[0,2],
        '2-0':[1,0],
        '1-1':[1,1],
        '0-2':[1,2],
        '2-1':[2,0],
        '2-2':[2,1],
        '0-3':[2,2],
        '3-0':[3,0],
        '3-3':[3,1],
        '0-4':[3,2],
        '3-1':[4,0],
        '4-4':[4,1],
        '1-2':[4,2],
        '3-2':[5,0],
        '1-3':[5,2],
        '4-0':[6,0],
        '1-4':[6,2],
        '4-1':[7,0],
        '2-3':[7,2],
        '4-2':[8,0],
        '2-4':[8,2],
        '4-3':[9,0],
        '3-4':[9,2],
        '5-0':[10,0],
        '5-5':[5,1],
        '0-5':[10,2],
        '5-1':[11,0],
        '1-5':[11,2],
        '5-2':[12,0],
        '2-5':[12,2],
        '5-3':[13,0],
        '3-5':[13,2],
        '5-4':[14,0],
        '4-5':[14,2],
    }
    for (const key in _data) {
        if (_data.hasOwnProperty(key)) {
            let element = _data[key][0];
            if(_key.indexOf(key) !=-1){
                let arr=[[],[],[]];
                let arr2 =[];
                for (const keys in element) {
                  if (element.hasOwnProperty(keys)) {
                    const e1 = element[keys];
                    if(_seat[e1.zh]){
                        
                        if(!arr[ _seat[e1.zh][0]]){
                            arr[ _seat[e1.zh]] =[];
                            arr[ _seat[e1.zh][0] ]=[];
                            arr[ _seat[e1.zh][0] ][0]={'zh':'','ioratio':'' };
                            arr[ _seat[e1.zh][0] ][1]={'zh':'','ioratio':'' };
                            arr[ _seat[e1.zh][0] ][2]={'zh':'','ioratio':'' };
                         }
                         arr[ _seat[e1.zh][0] ][ _seat[e1.zh][1] ] = e1;
                    }else{
                        arr2.push(e1); //補 沒有在列表內
                    }
                }

                }
                arr = arr.concat(arr2); //陣列相加
                _data[key] = arr;
            }
        }
    }

    return _data;
  }

    /**
   * 是否為走地
   */
  isGrounder() {
    return this.playStatus.play === Play.grounder
  }
    /**
   * 取得直播賽事列表
   */
  private getLiveData() {
    this.liveService.getLiveData().subscribe(liveData => {
      Observable.from(liveData)
      .filter(liveData => liveData.isOpened)
        .toArray()
        .do(()=>{   console.log(liveData);})
        .do(()=>{ this.filterID(liveData)})

        .subscribe();
    });
  }
  /**
   * 過濾直播資料
   * @param _arr 直播陣列
   */
  filterID(_arr){
    _arr.forEach(element => {
      
      if(element.id == this.gameData.gameID){
        element.rtmp = ( element.rtmp == 'Y');
        element.time_hh = parseInt(element.tw_time.substr(0,2));
        this.liveData = element;
        console.log(this.liveData);
        this.cd.markForCheck();

      }
    });
  }
  /**
   * 直播切換甕給外層操作
   */
  SwitchLive(){
    this.live_page = !this.live_page
    this.SwitchCSS.emit( this.live_page );
    this.cd.markForCheck();
  }
  /**
   * 更換橫條選項
   * @param _type 玩法
   */
  gameType(_type){
    console.log(_type);
    this.selectedGroup = _type;
    if(_type == 'ALL'){
      this.Overfiltration = '';
      return;
    }
    let Classification ={
      ALL:'',
      F:'*H_',
      UD:'H_',
      PD:'CS',
      R:'GH',
      SP:''
    }

 
    if(!Classification[_type]){
      this.Overfiltration = '';
 
      return;
    }
    this.Overfiltration = Classification[_type];
    console.log(this.Overfiltration );
  }
  SPsieve(_key){
    if(this.Overfiltration == ''){
      return true;
    }
    //反向做半場
    if(this.Overfiltration == '*H_'){
      if(_key.indexOf('H_') >= 0){
        return  false;
      }else{    return  true; }
    }
    if(_key.indexOf(this.Overfiltration) >= 0){
      return  true;
    }else{    return  false; }
  }
  Psieve(_key){
    if(this.Overfiltration == 'GH'){
      if(_key.indexOf('R') >= 0){
        return  true;
      }else{    return  false; }
    }
    if(this.Overfiltration == 'TG'){
      if(_key.indexOf('OU') >= 0){
        return  true;
      }else{    return  false; }
    }
    return  true;
  }
}