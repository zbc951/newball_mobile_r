// Angular
import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, NgModuleFactory, ChangeDetectorRef} from '@angular/core';
// App
import { Play } from '@app/ts/play';
import { Ball, IAppBalls } from '@app/ts/ball';
import { IGamesFile, IGame } from '@app/ts/game';
import { GamesService } from './games/games.service';

import { BallStatusService } from '@service/status-ball.service';
import { PlayStatusService } from '@service/status-play.service';

import { BallOptionService } from './ball-option.service';
import { RouterPath, DEFAULT } from '@app/app.config';
import { StatusSearchService } from '@lobby/status-search.service';
import { allSearchCollectDB, collect, SearchCollect } from '@lobby/search-collect';
import { BallQuantityService } from '@service/ball-quantity.service';
import { MemberService } from '@service/store-member.service';

import { ApiService } from '@app/service/api.service';
import { ConfigSetService } from '@app/service/config-set.service';
import { UidStatusService } from '@app/service/status-uid.service';
import { NameChartService } from '@service/name-chart.service';

import { appBalls } from 'ts/ball';
// RxJS
import { Observable } from 'rxjs/observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/takeUntil';
// lib
import { useAsync } from 'lib/helper/async';
import { UnSubscribe } from 'lib/ng-component';
import { Subscription } from 'rxjs/Subscription';
import { pick8Error } from 'ts/translate-value';
import { DialogStatusService } from '@app/service/status-dialog.service';

// import { OddsNamePipe } from './odds-name.pipe';
import { objCopy } from 'lib/helper';
import { ThrowStmt } from '@angular/compiler';
// swiper
import {
  SwiperConfigInterface,
  SwiperComponent
} from 'ngx-swiper-wrapper';
import { timeout } from 'rxjs/operator/timeout';
import { createPipeInstance } from '@angular/core/src/view/provider';




@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyComponent extends UnSubscribe implements OnInit {
  //各球種的資料
  AppBalls = appBalls.map(ball => {
    return {
      value: ball.value,         //球種名稱 EX: FT, BS...
      icon1: ball.icon1,         //球種icon名稱 css用
      icon2: ball.icon2,         //球種icon名稱 css用
      count: ball.count ,        //球種目前賽事數量
      titleAry: ball.titleAry,   //球種主畫面要顯示的玩法 EX:['R', 'OU', 'R_1', 'OU_1'] 代表該球種主要畫面顯示的玩法為 [讓分,大小,上半讓分,上半大小]
      detailAry: ball.detailAry, //球種詳細玩法 格式類似titleAry 但為二維陣列
      REdetailAry: ball.REdetailAry, //走地球種詳細玩法 格式類似titleAry 但為二維陣列
      R:[],RE:[],MPR:[]             //該球種的賽事資料
    }
  });
  LimitTypes = DEFAULT.LimitTypes || [];
  //主畫面的玩法標題
  titleAry: Array<string>;
  //玩法設定
  Play = Play;
  //賽事搜尋-聯盟過濾 (當此array有聯盟, 則畫面只顯示這些聯盟的賽事)
  searchLeagues: string[] = [];
  //賽事搜尋-日期過濾 (當此值不為空時,則只顯示該天的賽事)
  searchDate: string;
  //目前的模式 (單式, 滾球, 過關)
  activePlays: Play;
  //目前的球種
  activeBall = this.ballStatus.ball;
  //球種監聽
  ballOptSubscriber: Subscription = new Subscription;
  //球種選項
  ballOptions: IAppBalls[] = [];
  //初始化flag
  init: boolean = true;
  //賽事搜尋顯示flag
  isSearchActive: boolean = false;
  //跑馬燈文字
  marquee$: Observable<string>;
  //目前選擇的聯盟 (有選到的在畫面會展開)
  select: number = -1;
  //賽事搜尋的資料
  searchCollect: SearchCollect;
  //賽事搜尋-日期選擇資料
  searchQuickDate;
  //賽事搜尋-目前選擇到的日期index
  nowSelectedDateIndex: number = 0;
  //賽事搜尋-所有的聯盟選項
  searchLeagueOptions = [];
  //自動更新剩餘秒數
  updateCountdown = this.getCountdownTime();
  //賽事搜尋dialog的html元素
  searchDialog;
  //球種選擇器
  ballsSelecter = {getSelecterValue:()=>({index:0,value:''})};
  //路由路徑
  RouterPath = RouterPath;
  //賽事資訊
  gameFile$: Observable<IGamesFile[]>;
  //此元件是否存活
  isAlive: boolean = true;
  //顯示展開後的賽事資料flag (用來防止切換球種或玩法後馬上可以點到賽事做下注(但其實資料還在換))
  showGames: boolean = true;
  //世界盃32選8玩法是否開啟
  isPick8Enable = DEFAULT.isPick8Enable;
  //世界盃32選8玩法是否開放下注
  isPick8Open = DEFAULT.isPick8Open;
  // 最新公告
  newBulletinMsg = '';
  // swiper config
  swiperConfig: SwiperConfigInterface = {
    direction: 'horizontal',
    // 開啟滑鼠的抓手狀態
    grabCursor: true,
    // 被選中的滑塊居中，預設居左
    centeredSlides: true,
    loop: true,
    slidesPerView: 'auto',
    autoplay: 1500,
    speed: 1500,
  };
  //世界盃比賽隊伍
  worldCupTeams = [
    ['RUS', 'SAU', 'EGY', 'URY'],              
    ['PRT', 'ESP', 'MAR', 'IRN'],                 
    ['FRA', 'AUS', 'PER', 'DNK'],                
    ['ARG', 'ISL', 'HRV', 'NGA'],               
    ['BRA', 'CHE', 'CRI', 'SRB'],                 
    ['DEU', 'MEX', 'SWE', 'KOR'],                 
    ['BEL', 'PAN', 'TUN', 'ENG'],                
    ['POL', 'SEN', 'COL', 'JPN']
  ];
  //世界盃32選8的
  pick8Ary = [];
  //是否展開世界盃32選8
  pick8Active: boolean = false;
  //會員32選8選擇結果
  pick8Result = {
    hadBet: false,  //是否已經選過了
    result: [] //選過後的選項
  };
  //32選8專用錯誤訊息
  pick8Error = pick8Error[this.configSet.lang];
  //語言是否為簡體中文
  isLangCN = this.configSet.lang === 'zh-cn';
  //搜尋全選
  allSelect = false;
  //玩法監聽器
  playListener = null;
  //是否無視玩法監聽結果 (若在本頁面更改play service會偵測到一次變動導致再次觸發本頁的paly更動程式碼 此flag是用來控制讓重複觸發的狀況發生)
  ignorePlayChange = false;

  //列表葉面
  marketPage  = false;
  /**球 列表 */
  ballList: any;
  /**選擇玩法模式  判別混合狀態   EX:R,RE,MPR,all  。all=[混和模式 R+RE]  */
  ChoosePlayMode ='all';

  // 注單列表顯示
  ordersActive: boolean = false;
  // 顯示是否為未結注單
  finishOrder: boolean = false;

  /**切換玩法 */
  SwitchPlay:Boolean = false;
  /**設置選單-按鈕控制 */
  gameSwitchData:any={
    close:true,   //開關頁面
    beginner:this.configSet.beginner,  //新手版-專業版
    orderLeague:this.configSet.orderLeague, //聯盟-時間
    bet:this.configSet.openHKodd , //盤口賠率 香港.歐洲
    white:this.configSet.night //風格 日-夜 
  }

  // 是否顯示詳細賽事內容 
  gameDetailActive: boolean = false;
  // 詳細賽事資料
  gameDetailData = {};
  // 注單畫面關閉callback  
  public theBoundCallback: Function;
  // 顯示賽事詳細callback
  public gameDetailCallback: Function;
  // 賽事詳細關閉callback
  public gameDetailCloseCallback: Function;

  /**收尋隊名 */
  searchTeam: string = '';

  // 目前詳細清單的投注種類 圓盤 走地 串關 
  detailType: string;
  // 目前詳細清單的投注球種
  detailBall: string;
  //新增mail css
  livsCss:Boolean =true;
  constructor(
    public playStatus: PlayStatusService,
    public ballStatus: BallStatusService,
    private ballOptService: BallOptionService,
    private statusSearch: StatusSearchService,
    private nameChart: NameChartService,
    private api: ApiService,
    private configSet: ConfigSetService,
    private statusUid: UidStatusService,
    private cd: ChangeDetectorRef,
    private games: GamesService,
    private dialog: DialogStatusService,
    private ballQuantity: BallQuantityService,
    public member: MemberService
    ) {
    super();
  }

  /** 
   * 初始化
  */
  ngOnInit() { 
    // this.gamesListener();
    this.isPlayChange();
    this.getBillboard();
    this.keepUpdate();
    //this.checkPick8();
    this.titleAry = this.getMainShow(this.AppBalls, this.ballStatus.ball);
    this.getBallList();
    
    this.updateNewBulletin();
    this.theBoundCallback = this.closeOrders.bind(this);
    this.gameDetailCallback = this.showGameDetail.bind(this);
    this.gameDetailCloseCallback = this.gameDetailAction.bind(this);
  }
  /**
   * 離開畫面
   */
  ngOnDestroy() {
    this.playListener && this.playListener.unsubscribe();
    this.playStatus.play = Play.single;
    this.isAlive = false;
   // $('body').removeClass('dk');
    super.ngOnDestroy();
  }
  /**
   * 取得主要的標題玩法陣列
   * @param appBalls 球種資料
   * @param useBall  要取得資料的球種
   * @returns 標題玩法陣列
   */
  getMainShow (appBalls, useBall){
    for (let i = 0; i < appBalls.length; i++) {
      if (appBalls[i].value == useBall){
        return appBalls[i].titleAry;
      }
    }
  };

  //////////////////////////
  ////////玩法選擇///////////
  //////////////////////////

  /**
   * 設置玩法監聽器
   */
  isPlayChange() {
    this.playListener && this.playListener.unsubscribe();
    this.playListener = this.playStatus.play$
    // this.playStatus.play$.takeUntil(this.unSubscribe)
      .subscribe(play => {
        if (this.ignorePlayChange) {
          this.ignorePlayChange = false;
        } else {
          this.activePlays = play
          this.ballOptListener(play);
          this.cd.markForCheck();
        }
      });
  }
  
  /**
   * 選擇玩法
   * @param play 
   */
  changePlay(play: Play) {
    this.activePlays = play;
    this.playStatus.play = play;
    this.ignorePlayChange = true;
    this.ballOptListener(play);
    this.cd.markForCheck();
  }
  /**
   * 判斷目前玩法是否為該玩法
   * @param play 
   * @returns 目前玩法是否為該玩法
   */
  isPlayActive(play: Play): boolean {
    return this.activePlays === play;
  }


  private ballOptListener(play: Play) { //球種選項監聽器  更新目前有賽事的球種選項
    this.ballOptions = [];
    let arr = [];
    this.ballOptSubscriber.unsubscribe();

    const ballOptionsObserver = (ballOption) => {
      this.ballOptions.push(ballOption);
      this.ballOptions = this.ballOptions.filter((i, idx, arr) => arr.indexOf(i) === idx);
      this.cd.markForCheck();
    }

    this.ballOptSubscriber = this.ballOptService.getBallOptions(play)
      .takeUntil(this.unSubscribe)
      .subscribe(ballOptionsObserver);

    useAsync(() => this.ballChanger());

    
    const ballOptionsObserverALL = (ballOption) => {
      arr = [];
      this.ballOptions.forEach(element => {
        arr.push(element.value);
        if(element.value == ballOption.value){
          element.content.RE = ballOption.content.RE;
         // console.log('ballOption',ballOption);
        }
      });
      if(arr.indexOf(ballOption.value ) == -1){
        this.ballOptions.push(ballOption);
      }
    }

    //處理全部模式遺漏
    if(this.ChoosePlayMode == 'all'){
      
      this.ballOptService.getBallOptions(Play.grounder)
      .takeUntil(this.unSubscribe)
      .subscribe(ballOptionsObserverALL);

    useAsync(() => this.ballChanger());
    }
  }
  /** 
   * 自動切換球種(切換玩法後)
  */
  private ballChanger() {
    // 初次執行不需要跑 determineChange
    // if (this.init) { this.init = false; return; }
    const sameBallExist =
      this.ballOptions.find(option => option.value === this.ballStatus.ball);
    if (sameBallExist) {
      this.changeBall(this.ballStatus.ball);
    } else if (this.ballOptions[0]) {
      this.changeBall(this.ballOptions[0].value);
    } else {
      this.changeBall(null);
    }
  }
  /**
   * 切換目前球種
   */
  changeBall(ball: Ball) {
    this.activeBall = ball; //修改目前套用的球種
    this.searchLeagues = []; //將賽事搜尋的聯盟清空
    this.searchDate = undefined; //將賽事搜尋日期清空
    this.select = -1; //將展開的index重置
    this.ballStatus.ball = ball; //設定球種
    this.pick8Active = false;
    this.titleAry = this.getMainShow(this.AppBalls, this.ballStatus.ball); //更新外層玩法顯示
    if(!ball){return}
    let found = 0;
    for (let i = 0; i < this.AppBalls.length; i++) {
      if (this.AppBalls[i].value === ball) {
        found = i;
        break;
      }
    }

    this.games.getGameFile(this.playStatus.play, ball, true).subscribe(res => {
      this.AppBalls[found][this.playStatus.play] = res;
        this.showGames = false;
        setTimeout(() => {
          this.showGames = true;
          this.cd.markForCheck();
        }, 500);
        this.cd.markForCheck();
      }
    );
    if(this.ChoosePlayMode == 'all'){

      this.games.getGameFile(Play.grounder, ball, true).subscribe(res => {
        this.AppBalls[found][Play.grounder] = res;
          this.showGames = false;
          setTimeout(() => {
            this.showGames = true;
            this.cd.markForCheck();
          }, 500);
          this.cd.markForCheck();
        }
      );
    }


    this.getSearchCollect(this.activeBall);
    this.cd.markForCheck();
  }
  /**
   * 判斷目前球種是否為該球種
   * @param ball
   * @returns boolean 目前球種是否為該球種
   */
  isBallActive(ball: Ball): boolean {
    return this.activeBall === ball;
  }

  //////////////////////////
  ////////跑馬燈/////////////
  //////////////////////////
  /**
   * 取得跑馬燈內容
   */
  getBillboard() {
    const req = { uid: this.statusUid.uid, langx: this.configSet.lang };
    this.marquee$ = this.api.postServer(151, req, false)
      .map(res => res.ret)
      .map(marqueeList => {
        if (!(marqueeList && marqueeList[0] && marqueeList[1])) {
          return;
        }
        // 串接跑馬燈前三筆
        const marquee = marqueeList[0][1] + '  ' + marqueeList[1][1];
        // 設定跑馬燈動畫參數
        return marquee;
      });
  }
  /**
   * 開啟/關閉搜尋dialog
   */
  toggleSearch() {
    this.isSearchActive = !this.isSearchActive;
    if (this.isSearchActive) {
      this.searchTeam = '';
      this.getSearchCollect(this.activeBall);
    }
  }
  /**
   * 在搜尋畫面時處理touch事件
   * @param event 
   */
  searchMoveStart(event) {
    let noMove = function(e) {
      e.preventDefault();
    }
    let canMove = function(e) {
      let searchDialog = document.getElementById('searchDialog');
      searchDialog.removeEventListener('touchmove', noMove);
      searchDialog.removeEventListener('touchend', canMove);
    }
    if (event.path.filter(item => item.id === 'search-league-list').length === 0) {
      setTimeout(() => {
        this.searchDialog = document.getElementById('searchDialog');
        if (this.searchDialog) {
          this.searchDialog.addEventListener('touchmove', noMove, false);
          this.searchDialog.addEventListener('touchend', canMove, false);
        }
      }, 100);
    }
  }

  /**
   * 賽事搜尋的日期選擇
   */
  private quickSelectDate(index) {
    this.nowSelectedDateIndex = index;
  }

  /**
   * 更新賽事搜尋資料
   * @param ball 
   */
  private getSearchCollect(ball) {
    // this.ballsSelecter = this.createScrollSelecter('ball', this.ballOptions.map(item => item.value), null, ball);
    if (allSearchCollectDB[this.playStatus.play] && allSearchCollectDB[this.playStatus.play][ball]) {
     
  

      //已有賽事資料
      this.searchCollect = allSearchCollectDB[this.playStatus.play][ball];
      if(this.ChoosePlayMode == 'all'){
        if(allSearchCollectDB['RE']&& allSearchCollectDB['RE'][ball]){
         let arr1 =[];
         let arr2 =[];
         allSearchCollectDB['RE'][ball]['leagueCollects'].forEach(element => {
          arr1.push(element.league);
          arr2.push(element.count);
         });
         this.searchCollect['leagueCollects'].forEach(element => {
           if(arr1.indexOf(element.league) >=0){
            arr1[arr1.indexOf(element.league)] = arr1[arr1.indexOf(element.league)]+'@'+arr2[arr1.indexOf(element.league)];
          //  element.count+=arr2[arr1.indexOf(element.league)];
           }
         });
         arr1.forEach((val,key) => {
           if(val.indexOf('@') == -1){
            this.searchCollect['leagueCollects'].push(
              {
                league:val,
                count:arr2[key]
              }
            )
           }
         });
        }
      }
  
      this.searchQuickDate = this.searchCollect.dateCollects.slice(0, 4).map(date => ({showValue: moment(date.date).format('MM/DD'),value:date}));
      this.searchLeagueOptions = this.searchCollect.leagueCollects.map(item => ({name: item.league, active: false,count:item.count}));
      this.cd.markForCheck();
    } else {
      //沒有賽事資料
      let found = 0;
      for (let i = 0; i < this.AppBalls.length; i++) {
        if (this.AppBalls[i].value === ball) {
          found = i;
          break;
        }
      }
      this.games.getGameFile(this.playStatus.play, ball).subscribe(res => {
          this.AppBalls[found][this.playStatus.play] = res;
          this.cd.markForCheck();
        }
      );
      if(this.ChoosePlayMode == 'all'){
        this.games.getGameFile(Play.grounder, ball).subscribe(res => {
          this.AppBalls[found][Play.grounder] = res;
          this.cd.markForCheck();
        }
      );
      }
    }
   // console.log('searchLeagueOptions',this.searchLeagueOptions);
  }
  /**
   * 更新賽事搜尋資料/(在賽事搜尋畫面切換球種時呼叫)
   * @param ball 
   */
  // private getSearchCollectAfter(ball) {
  //   console.log('getSearchCollectAfter');
  //   if (allSearchCollectDB[this.playStatus.play] && allSearchCollectDB[this.playStatus.play][ball]) {
  //     //有賽事資料
  //     this.searchCollect = allSearchCollectDB[this.playStatus.play][ball];
  //     this.searchQuickDate = this.searchCollect.dateCollects.slice(0, 4).map(date => ({showValue: moment(date.date).format('MM/DD'),value:date}));
  //     this.searchLeagueOptions = this.searchCollect.leagueCollects.map(item => ({name: item.league, active: false}));
  //     this.nowSelectedDateIndex = 0;
  //     this.cd.markForCheck();
  //   } else {
  //     //沒有賽事資料
  //     let found = 0;
  //     for (let i = 0; i < this.AppBalls.length; i++) {
  //       if (this.AppBalls[i].value === ball) {
  //         found = i;
  //         break;
  //       }
  //     }
      
  //     this.games.getGameFile(this.playStatus.play, ball).subscribe(res => {
  //         this.AppBalls[found][this.playStatus.play] = res;
  //         this.searchCollect = allSearchCollectDB[this.playStatus.play][ball];
  //         if (this.searchCollect) {
  //           this.searchQuickDate = this.searchCollect.dateCollects.slice(0, 4).map(date => ({showValue: moment(date.date).format('MM/DD'),value:date}));
  //           this.searchLeagueOptions = this.searchCollect.leagueCollects.map(item => ({name: item.league, active: false}));
  //           this.nowSelectedDateIndex = 0;
  //         } else {
  //           this.searchQuickDate = [];
  //           this.nowSelectedDateIndex = 0;
  //           this.searchLeagueOptions = [];
  //         }
  //         this.cd.markForCheck();
  //       }
  //     );
  //     if(this.ChoosePlayMode == 'all'){
  //       this.games.getGameFile(Play.grounder, ball).subscribe(res => {
  //         this.AppBalls[found][Play.grounder]= res;
  //         this.searchCollect = allSearchCollectDB[this.playStatus.play][ball];
  //         if (this.searchCollect) {
  //           this.searchQuickDate = this.searchCollect.dateCollects.slice(0, 4).map(date => ({showValue: moment(date.date).format('MM/DD'),value:date}));
  //           this.searchLeagueOptions = this.searchCollect.leagueCollects.map(item => ({name: item.league, active: false}));
  //           this.nowSelectedDateIndex = 0;
  //         } else {
  //           this.searchQuickDate = [];
  //           this.nowSelectedDateIndex = 0;
  //           this.searchLeagueOptions = [];
  //         }
  //         this.cd.markForCheck();
  //       }
  //     );
  //     }
  //   }
  // }

  /**
   * 選擇器變動(賽事搜尋頁面)
   * @param selecterName 
   * @param index 
   * @param value 
   * @param self 
   */
  private onSelecterChange(selecterName, index, value, self) {
    if (selecterName === 'ball') {
      self.getSearchCollectAfter(value);
    }
  }
  /**
   * 建立新的選擇器
   * @param selecterName string        選擇器名稱 
   * @param items        array<string> 選擇器的選項
   * @param firstName    string        選擇器的第一個選項 EX:所有XX 若有值 則會增加一個選項在該選擇器的第一個位置
   * @param defaultName  string        選擇器的預設選項 若有值 一開始選擇器就會切換到該值的位置
   */
  private createScrollSelecter(selecterName, items, firstName = null, defaultName = null) {
    //該選擇器
    let self = this;
    //該選擇器的選項陣列(所有)
    let orgScrollItems;

    if (firstName) { //有設置第一個選項
      orgScrollItems = items.map((item, index) => {
        return {
          deg: (index + 1) * 30,
          name: item,
          count: index + 1
        }
      });
      orgScrollItems.unshift({
        deg: 0,
        name: firstName,
        count: 0
      });
    } else {  //沒有設置第一個選項
      orgScrollItems = items.map((item, index) => {
        return {
          deg: index * 30,
          name: item,
          count: index
        }
      });
    }

    //目前顯示的 選擇器選項陣列(12個)
    let scrollItems = [];
    for(let i = 0; i < 12; i++) {
      scrollItems.push({
        name: '',
        index: i
      })
    }

    //選擇器預設選項index
    let defaultIndex = 0;
    if (defaultName) {
      for (let i = 0; i < orgScrollItems.length; i++) {
        if (orgScrollItems[i].name == defaultName) {
          defaultIndex = i;
          break;
        }
      }
    }
    //更新 目前選擇器選項陣列(12個)
    for (let i = -5; i < 7; i++) {
      let nowItemIndex = defaultIndex + i;
      if (nowItemIndex < 0) {
        scrollItems[nowItemIndex + 12].name = '';
        scrollItems[nowItemIndex + 12].index = 0;
      } else if (nowItemIndex < orgScrollItems.length) {
        scrollItems[nowItemIndex % 12].name = orgScrollItems[nowItemIndex].name;
        scrollItems[nowItemIndex % 12].index = orgScrollItems[nowItemIndex].index;
      } else {
        scrollItems[nowItemIndex % 12].name = '';
        scrollItems[nowItemIndex % 12].index = 0;
      }
    }
    // 目前選擇器角度
    let deg = `rotateX(${(defaultIndex + 1) * 30}deg)`;

    return {
      //更新畫面渲染用
      cd: this.cd,
      //該選擇器
      self: self,
      //選擇器選項變動時的callback
      onChange: this.onSelecterChange,
      //選擇器名稱
      name: selecterName,
      //選擇器目前角度
      deg: deg,
      //該選擇器的選項陣列(所有)
      orgScrollItems: orgScrollItems,
      //目前選擇器選到的選項index
      nowSelectedIndex: defaultIndex,
      //目前顯示的 選擇器選項陣列(12個)
      scrollItems: scrollItems,
      /**
       * 取得該選擇器目前選到的選項
       */
      getSelecterValue: function() {
        return {
          value: this.orgScrollItems[this.nowSelectedIndex].name,
          index: this.nowSelectedIndex
        };
      },
      /**
       * 處理移動事件
       */
      startScroll: function(event, comp) {
        let shiftX = event.clientX;
        let shiftY = event.clientY;
        let change = 0;
        if (event.changedTouches && event.changedTouches[0]) {
          shiftX = event.changedTouches[0].clientX;
          shiftY = event.changedTouches[0].clientY;
        }
        function moveAt(clientX, clientY) {
          if (Math.abs(((shiftY - clientY) * 0.3) - change) > 5) { //減少搖晃
            change = (shiftY - clientY) * 0.3;
            if (change > 180) change = 180;
            else if (change < -150) change = -150;
            comp.changeDeg(change);
          }
        }
        function onMouseMove(event) {
          event.preventDefault();
          if (event.changedTouches && event.changedTouches[0]) {
            moveAt(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
          }
        }
        function onTouchEnd(event){
          comp.updateScrollItem(comp.nowSelectedIndex + Math.round(change / 30));
          document.removeEventListener('touchmove', onMouseMove);
          document.removeEventListener('touchend', onTouchEnd);
        }
        document.addEventListener('touchmove', onMouseMove);
        document.addEventListener('touchend', onTouchEnd);
      },
      /**
       * 更改選擇器角度
       */
      changeDeg: function(change) {
        let nowDeg = (this.nowSelectedIndex + 1) * 30 + change;
        if (nowDeg < 30) nowDeg = 30;
        else if (nowDeg > this.orgScrollItems.length * 30) nowDeg = this.orgScrollItems.length * 30
        this.deg = `rotateX(${nowDeg}deg)`;
        this.cd.markForCheck();
      },
      /**
       * 更新目前可顯示的選項
       */
      updateScrollItem: function(index) {
        if (index < 0) index = 0;
        else if(index >= this.orgScrollItems.length) index = this.orgScrollItems.length - 1;

        for (let i = -5; i < 7; i++) {
          let nowItemIndex = index + i;
          if (nowItemIndex < 0) {
            this.scrollItems[nowItemIndex + 12].name = '';
            this.scrollItems[nowItemIndex + 12].index = 0;
          } else if (nowItemIndex < this.orgScrollItems.length) {
            this.scrollItems[nowItemIndex % 12].name = this.orgScrollItems[nowItemIndex].name;
            this.scrollItems[nowItemIndex % 12].index = this.orgScrollItems[nowItemIndex].index;
          } else {
            this.scrollItems[nowItemIndex % 12].name = '';
            this.scrollItems[nowItemIndex % 12].index = 0;
          }
        }
        this.deg = `rotateX(${(index + 1) * 30}deg)`;
        this.nowSelectedIndex = index;
        this.onChange(this.name, index, this.orgScrollItems[index].name, self);
        this.cd.markForCheck();
      }
    };

  }
  /**
   * 搜尋(過濾)賽事
   */
  search() {
    // let ball: any = this.ballsSelecter.getSelecterValue().value;
    // this.ballStatus.ball = ball;
    // this.activeBall = ball;
    if (this.nowSelectedDateIndex === 0) {
      this.searchDate = undefined;
    } else {
      this.searchDate = this.searchQuickDate[this.nowSelectedDateIndex - 1].value;
    }
    if (this.getActiveLeagues() === 0) {
      this.searchLeagues = [];
    } else {
      this.searchLeagues = this.searchLeagueOptions.filter(item => item.active).map(item => item.name);
    }

    this.toggleSearch();
    this.select = -1;
  }
  DataSearch(){
    if (this.nowSelectedDateIndex === 0) {
      this.searchDate = undefined;
    } else {

      this.searchDate = this.searchQuickDate[this.nowSelectedDateIndex - 1].value;
    }
  }

  reflash(){
    this.updateCountdown = this.getCountdownTime();
    this.nameChart.getAllNameChart();
    this.updateGameData(true);
  }
  /**
   * 取得倒數時間
   */
  getCountdownTime() {
    return this.activePlays === Play.grounder ? 10 : 60;
  }
  /**
   * 更新賽事
   */
  updateGameData(showPC = false){
    this.games.getGameFile(this.playStatus.play, this.ballStatus.ball, showPC).subscribe(res => {
      let found = -1;
      for (let i = 0; i < this.AppBalls.length; i++) {
        if (this.AppBalls[i].value === this.ballStatus.ball) {
          found = i;
          break;
        }
      }
      if (found >= 0) {
        this.AppBalls[found][this.playStatus.play] = res;
        if (this.gameDetailActive && this.ballStatus.ball == this.detailBall) {
          var mapGame = this.getGameByGdata(this.gameDetailData, this.detailBall, this.detailType);
          if (mapGame) {
            this.gameDetailData = mapGame;
          }
        }
        this.cd.markForCheck();
      }
    });
    if(this.ChoosePlayMode == 'all'){
      this.games.getGameFile(Play.grounder, this.ballStatus.ball, showPC).subscribe(res => {
        let found = -1;
        for (let i = 0; i < this.AppBalls.length; i++) {
          if (this.AppBalls[i].value === this.ballStatus.ball) {
            found = i;
            break;
          }
        }
        if (found >= 0) {
          this.AppBalls[found][Play.grounder] = res;
          this.cd.markForCheck();
        }
      });
    }

  }
  /**
   * 取得球種的顯示玩法
   */
  getDetailAry(ball) {
    return this.playStatus.play === Play.grounder ? ball.REdetailAry : ball.detailAry;
  }
  /**
   * 計時
   */
  keepUpdate() {
    setTimeout(() => {
      if (this.updateCountdown > 0) {
        this.updateCountdown--;
      }
      if (this.updateCountdown <= 0) { //倒數到了後更新賽事資訊
        this.updateGameData();
        this.updateCountdown = this.getCountdownTime();
      }
      this.cd.markForCheck();
      this.isAlive && this.keepUpdate();
    }, 1000);
  }
  /**
   * 設定目前展開的聯盟
   */
  selectToggle(idx) {
    this.select = (this.select === idx) ? -1 : idx;
    if (this.select >= 0) {
    }
  }
  /**
   * 取得賽事搜尋目前選擇的聯盟數量
   */
  getActiveLeagues() {
    return this.searchLeagueOptions.filter(item => item.active).length;
  }
  /**
   * 賽事搜尋的聯盟過濾改為顯示全部聯盟
   */
  chooseAllLeagues() {
    for (let i = 0; i < this.searchLeagueOptions.length; i++) {
      this.searchLeagueOptions[i].active = false;
    }
  }
  /**
   * 連結至世界盃賽程表
   */
  toTimeTable() {
    if(DEFAULT.isCN) {
      window.open('http://wcup.ba88soft.com/cnimg2018-1.jpg', '_blank');

    } else {
      window.open('http://wcup.ba88soft.com/img2018-1.jpg', '_blank');
    }
  }
  /**
   * 取得世界盃組別名稱
   */
  numberToChar(index) {
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'][index];
  }
  /**
   * 32選8 - 選擇國家
   * @param country 國家代號
   */
  togglePick8(country) {
    let found = this.pick8Ary.indexOf(country);
    if (found >= 0) {
      this.pick8Ary.splice(found, 1);
    } else if (this.pick8Ary.length < 8){
      this.pick8Ary.push(country);
    }
  }
  /**
   * 取得該國家是否被選取
   */
  isPicked(country) {
    return (!this.pick8Result.hadBet) && this.pick8Ary.indexOf(country) >= 0;
  }
  /**
   * 將32選8選擇的選項清除
   */
  pick8clear() {
    this.pick8Ary = [];
  }
  /**
   * 進行32選8競猜
   */
  pick8bet() {
    if (this.pick8Ary.length !== 8) {
      this.dialog.alert(this.pick8Error['wrongCount']);
      return;
    }
    const req = { uid: this.statusUid.uid, team: this.pick8Ary.join(',') };
    this.api.postServer(311, req)
    .subscribe(res => {
      if (res.err && res.ret && res.ret.status === 'order success') {
        this.pick8Result = {
          hadBet: true,
          result: res.ret.team.split(',')
        }
      } else {
        this.whatError(res.err_msg)
      }
      this.cd.markForCheck();
    });
  }
  /**
   * 確認該會員32選8選擇結果
   */
  checkPick8() {
    const req = { uid: this.statusUid.uid, team: this.pick8Ary.join(',') };
    this.api.postServer(312, req, false)
    .subscribe(res => {
      if (res.err && res.ret && res.ret.team) {
        this.pick8Result = {
          hadBet: true,
          result: res.ret.team.split(',')
        }
      }
    });
  }
  /**
   * 轉換32選8錯誤訊息
   */
  whatError(err_msg) {
    switch(err_msg) {
      case '100':
        this.dialog.alert(this.pick8Error['alreadyBet']);
        break;
      case '101':
        this.dialog.alert(this.pick8Error['wrongCount']);
        break;
      case '102':
        this.dialog.alert(this.pick8Error['wrongData']);
        break;
    }
  }
  /**
   * 取得32選8確定按鈕文字
   */
  getConfirmBtnTxt() {
    if (this.pick8Ary.length < 8) {
      return this.getLeftText(this.pick8Ary.length);
    }
    return {'zh-tw': '競猜', 'zh-cn': '竞猜', 'ja-jp': '竞猜'}[this.configSet.lang];
  }
  /**
   * 取得32選8文字
   */
  getLeftText(count) {
    switch(this.configSet.lang) {
      case 'zh-tw':
        return `已選(${count}/8)組`;
      case 'zh-cn':
        return `已选(${count}/8)组`;
      default:
        return count + '/8';
    }
  }
  /**
   * 是否可以競猜32選8
   */
  isCanBetPick8() {
    return this.pick8Ary.length === 8;
  }
  /**
   * 切換搜尋全選按鈕
   */
  toggleAllSelect() {
    if (this.allSelect) {
      this.allSelect = false;
      for (let i = 0; i < this.searchLeagueOptions.length; i++) {
        this.searchLeagueOptions[i].active = false;
      }
    } else {
      this.allSelect = true;
      for (let i = 0; i < this.searchLeagueOptions.length; i++) {
        this.searchLeagueOptions[i].active = true;
      }
    }
  }
  /**
   * 
   */
  isNoGame() {
    if (this.ballStatus.ball === 'EF' && this.isPick8Enable) {
      return false;
    }
    let nowBallData = this.AppBalls.filter(ball => ball.value === this.ballStatus.ball)[0];
    if (nowBallData) {
      if (nowBallData[this.playStatus.play].length === 0) return true;
      return false;
    }
    return true;
  } 
  /**求列表 */
  getBallList(){
    this.ballQuantity.getBallQuantity().subscribe(arr => {
      this.ballList = arr;
    });
   
  }
  /**
   * 畫面 切換球種
   * @param _ball 球
   */
  market(_ball){
    //this.changePlay();
    this.changeBall(_ball);  //切換球

    this.marketPage = !this.marketPage;


    this.gameSwitchData['beginner'] = this.configSet.beginner;
    this.gameSwitchData['orderLeague']  = this.configSet.orderLeague;
    this.gameSwitchData['bet']  = this.configSet.openHKodd;
    this.gameSwitchData['white']  = this.configSet.night;

    
  }
  /**
   * 畫面選擇玩法
   * @param _play 玩法
   */
  processChangePlay(_play){
    this.ChoosePlayMode = _play;
    if(_play == 'all'){

      this.changePlay(Play.single);
    }else{
      this.changePlay(_play);
    }

  }

  /**
   * 取得最新訊息
   */
  updateNewBulletin() {
    const req = { 'uid': this.statusUid.uid, 'langx': this.configSet.lang };
    var newMsg = '';
    this.api.postServer(151, req).subscribe(apiRes => {
      if (apiRes && apiRes.ret && apiRes.ret[0] && apiRes.ret[0][1]) {
        newMsg = apiRes.ret[0][1];
      }
      this.newBulletinMsg = newMsg;
      this.cd.markForCheck();
    });  
  }
  /**返回首頁 */
  backHome(){
    this.marketPage = false;
    this.SwitchPlay =  false;
    this.changeBall(null);
  }
  /**
   * 開啟注單畫面
   * @param finish 是否結算
   */
  checkOrders(finish) {
    this.finishOrder = finish;
    this.ordersActive = true;
  };
  /**
   * 關閉注單畫面
   */
  public closeOrders() {
    this.ordersActive = false;
  }
  /**
   * 開啟賽事詳細畫面
   * @param gameData 賽事資料
   */
  public showGameDetail(gameData, type, ball) {
    this.gameDetailData = gameData;
    this.detailType = type;
    this.detailBall = ball;
    this.gameDetailActive = true;
  }
  /**
   * 搜尋指定賽事
   */
  private getGameByGdata(gdata, ball, type) {
    if (gdata && gdata.leagueID && gdata.gameID) {
      var found = this.AppBalls.filter(b => b.value == ball);
      if (found[0] && found[0][type]) {
        var list = found[0][type];
        for (var li = 0; li < list.length; li++) {
          var league = list[li];
          if (league && league.lid == gdata.leagueID) {
            for (var gi = 0; gi < league.games.length; gi++) {
              var game = league.games[gi];
              if (game.gameID == gdata.gameID) {
                return game;
              }
            }
          }
        }
      }
    }
    return false;
  }
  /**
   * 關閉賽事詳細畫面
   */
  public gameDetailAction(action) {
    if (action == 'close') {
      this.gameDetailActive = false;
    } else if(action == 'update') {
      this.reflash();
    }
  }
  isgame(){
    let data;
    this.AppBalls.forEach(element => {
        if(element.value == this.ballStatus.ball){
          data = element;
        }
    });
    if(this.ChoosePlayMode == 'all'){
      if(data['R'].length + data['RE'].length  == 0){
        return true;
      }
    }else{
      if(data[this.ChoosePlayMode].length   == 0){
        return true;
      }
    }
    return false;
  }
  /**
   * 設置選單-按鈕控制
   * <game-switch> 按鈕切換
   * @param _data Output出來的callSwitch.emit(_d) ["beginner", true]
   */
  SwitchButton(_data){
    this.gameSwitchData[_data[0]] = _data[1];
    if (_data[0] == 'bet') {
      this.configSet.setOdd(this.gameSwitchData['bet'])
    } else if (_data[0] == 'white') {
      this.configSet.night = _data[1];
    } else if (_data[0] == 'orderLeague') {
      this.configSet.orderLeague = _data[1];
    } else if (_data[0] == 'beginner') {
      this.configSet.beginner = _data[1];
    }
    if(_data[0] !== 'close'){
      this.cd.markForCheck();
      let JSON_stringify = JSON.stringify(this.gameSwitchData);
      let replace =JSON_stringify.replace(/\"/g,'^');
      const req = { 'uid': this.statusUid.uid, 'pro_viewmemo': replace };
      this.api.postServer(403, req).subscribe(apiRes => {
      });  
    }
  }
  SwitchCSS(_B){
    console.log(_B);
    this.livsCss=_B;
  }
}
