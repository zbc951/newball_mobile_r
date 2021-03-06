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
  //??????????????????
  AppBalls = appBalls.map(ball => {
    return {
      value: ball.value,         //???????????? EX: FT, BS...
      icon1: ball.icon1,         //??????icon?????? css???
      icon2: ball.icon2,         //??????icon?????? css???
      count: ball.count ,        //????????????????????????
      titleAry: ball.titleAry,   //????????????????????????????????? EX:['R', 'OU', 'R_1', 'OU_1'] ????????????????????????????????????????????? [??????,??????,????????????,????????????]
      detailAry: ball.detailAry, //?????????????????? ????????????titleAry ??????????????????
      REdetailAry: ball.REdetailAry, //???????????????????????? ????????????titleAry ??????????????????
      R:[],RE:[],MPR:[]             //????????????????????????
    }
  });
  LimitTypes = DEFAULT.LimitTypes || [];
  //????????????????????????
  titleAry: Array<string>;
  //????????????
  Play = Play;
  //????????????-???????????? (??????array?????????, ???????????????????????????????????????)
  searchLeagues: string[] = [];
  //????????????-???????????? (?????????????????????,???????????????????????????)
  searchDate: string;
  //??????????????? (??????, ??????, ??????)
  activePlays: Play;
  //???????????????
  activeBall = this.ballStatus.ball;
  //????????????
  ballOptSubscriber: Subscription = new Subscription;
  //????????????
  ballOptions: IAppBalls[] = [];
  //?????????flag
  init: boolean = true;
  //??????????????????flag
  isSearchActive: boolean = false;
  //???????????????
  marquee$: Observable<string>;
  //????????????????????? (??????????????????????????????)
  select: number = -1;
  //?????????????????????
  searchCollect: SearchCollect;
  //????????????-??????????????????
  searchQuickDate;
  //????????????-????????????????????????index
  nowSelectedDateIndex: number = 0;
  //????????????-?????????????????????
  searchLeagueOptions = [];
  //????????????????????????
  updateCountdown = this.getCountdownTime();
  //????????????dialog???html??????
  searchDialog;
  //???????????????
  ballsSelecter = {getSelecterValue:()=>({index:0,value:''})};
  //????????????
  RouterPath = RouterPath;
  //????????????
  gameFile$: Observable<IGamesFile[]>;
  //?????????????????????
  isAlive: boolean = true;
  //??????????????????????????????flag (?????????????????????????????????????????????????????????????????????(????????????????????????))
  showGames: boolean = true;
  //?????????32???8??????????????????
  isPick8Enable = DEFAULT.isPick8Enable;
  //?????????32???8????????????????????????
  isPick8Open = DEFAULT.isPick8Open;
  // ????????????
  newBulletinMsg = '';
  // swiper config
  swiperConfig: SwiperConfigInterface = {
    direction: 'horizontal',
    // ???????????????????????????
    grabCursor: true,
    // ???????????????????????????????????????
    centeredSlides: true,
    loop: true,
    slidesPerView: 'auto',
    autoplay: 1500,
    speed: 1500,
  };
  //?????????????????????
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
  //?????????32???8???
  pick8Ary = [];
  //?????????????????????32???8
  pick8Active: boolean = false;
  //??????32???8????????????
  pick8Result = {
    hadBet: false,  //?????????????????????
    result: [] //??????????????????
  };
  //32???8??????????????????
  pick8Error = pick8Error[this.configSet.lang];
  //???????????????????????????
  isLangCN = this.configSet.lang === 'zh-cn';
  //????????????
  allSelect = false;
  //???????????????
  playListener = null;
  //?????????????????????????????? (?????????????????????play service???????????????????????????????????????????????????paly??????????????? ???flag?????????????????????????????????????????????)
  ignorePlayChange = false;

  //????????????
  marketPage  = false;
  /**??? ?????? */
  ballList: any;
  /**??????????????????  ??????????????????   EX:R,RE,MPR,all  ???all=[???????????? R+RE]  */
  ChoosePlayMode ='all';

  // ??????????????????
  ordersActive: boolean = false;
  // ???????????????????????????
  finishOrder: boolean = false;

  /**???????????? */
  SwitchPlay:Boolean = false;
  /**????????????-???????????? */
  gameSwitchData:any={
    close:true,   //????????????
    beginner:this.configSet.beginner,  //?????????-?????????
    orderLeague:this.configSet.orderLeague, //??????-??????
    bet:this.configSet.openHKodd , //???????????? ??????.??????
    white:this.configSet.night //?????? ???-??? 
  }

  // ?????????????????????????????? 
  gameDetailActive: boolean = false;
  // ??????????????????
  gameDetailData = {};
  // ??????????????????callback  
  public theBoundCallback: Function;
  // ??????????????????callback
  public gameDetailCallback: Function;
  // ??????????????????callback
  public gameDetailCloseCallback: Function;

  /**???????????? */
  searchTeam: string = '';

  // ????????????????????????????????? ?????? ?????? ?????? 
  detailType: string;
  // ?????????????????????????????????
  detailBall: string;
  //??????mail css
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
   * ?????????
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
   * ????????????
   */
  ngOnDestroy() {
    this.playListener && this.playListener.unsubscribe();
    this.playStatus.play = Play.single;
    this.isAlive = false;
   // $('body').removeClass('dk');
    super.ngOnDestroy();
  }
  /**
   * ?????????????????????????????????
   * @param appBalls ????????????
   * @param useBall  ????????????????????????
   * @returns ??????????????????
   */
  getMainShow (appBalls, useBall){
    for (let i = 0; i < appBalls.length; i++) {
      if (appBalls[i].value == useBall){
        return appBalls[i].titleAry;
      }
    }
  };

  //////////////////////////
  ////////????????????///////////
  //////////////////////////

  /**
   * ?????????????????????
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
   * ????????????
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
   * ????????????????????????????????????
   * @param play 
   * @returns ??????????????????????????????
   */
  isPlayActive(play: Play): boolean {
    return this.activePlays === play;
  }


  private ballOptListener(play: Play) { //?????????????????????  ????????????????????????????????????
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

    //????????????????????????
    if(this.ChoosePlayMode == 'all'){
      
      this.ballOptService.getBallOptions(Play.grounder)
      .takeUntil(this.unSubscribe)
      .subscribe(ballOptionsObserverALL);

    useAsync(() => this.ballChanger());
    }
  }
  /** 
   * ??????????????????(???????????????)
  */
  private ballChanger() {
    // ???????????????????????? determineChange
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
   * ??????????????????
   */
  changeBall(ball: Ball) {
    this.activeBall = ball; //???????????????????????????
    this.searchLeagues = []; //??????????????????????????????
    this.searchDate = undefined; //???????????????????????????
    this.select = -1; //????????????index??????
    this.ballStatus.ball = ball; //????????????
    this.pick8Active = false;
    this.titleAry = this.getMainShow(this.AppBalls, this.ballStatus.ball); //????????????????????????
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
   * ????????????????????????????????????
   * @param ball
   * @returns boolean ??????????????????????????????
   */
  isBallActive(ball: Ball): boolean {
    return this.activeBall === ball;
  }

  //////////////////////////
  ////////?????????/////////////
  //////////////////////////
  /**
   * ?????????????????????
   */
  getBillboard() {
    const req = { uid: this.statusUid.uid, langx: this.configSet.lang };
    this.marquee$ = this.api.postServer(151, req, false)
      .map(res => res.ret)
      .map(marqueeList => {
        if (!(marqueeList && marqueeList[0] && marqueeList[1])) {
          return;
        }
        // ????????????????????????
        const marquee = marqueeList[0][1] + '  ' + marqueeList[1][1];
        // ???????????????????????????
        return marquee;
      });
  }
  /**
   * ??????/????????????dialog
   */
  toggleSearch() {
    this.isSearchActive = !this.isSearchActive;
    if (this.isSearchActive) {
      this.searchTeam = '';
      this.getSearchCollect(this.activeBall);
    }
  }
  /**
   * ????????????????????????touch??????
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
   * ???????????????????????????
   */
  private quickSelectDate(index) {
    this.nowSelectedDateIndex = index;
  }

  /**
   * ????????????????????????
   * @param ball 
   */
  private getSearchCollect(ball) {
    // this.ballsSelecter = this.createScrollSelecter('ball', this.ballOptions.map(item => item.value), null, ball);
    if (allSearchCollectDB[this.playStatus.play] && allSearchCollectDB[this.playStatus.play][ball]) {
     
  

      //??????????????????
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
      //??????????????????
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
   * ????????????????????????/(??????????????????????????????????????????)
   * @param ball 
   */
  // private getSearchCollectAfter(ball) {
  //   console.log('getSearchCollectAfter');
  //   if (allSearchCollectDB[this.playStatus.play] && allSearchCollectDB[this.playStatus.play][ball]) {
  //     //???????????????
  //     this.searchCollect = allSearchCollectDB[this.playStatus.play][ball];
  //     this.searchQuickDate = this.searchCollect.dateCollects.slice(0, 4).map(date => ({showValue: moment(date.date).format('MM/DD'),value:date}));
  //     this.searchLeagueOptions = this.searchCollect.leagueCollects.map(item => ({name: item.league, active: false}));
  //     this.nowSelectedDateIndex = 0;
  //     this.cd.markForCheck();
  //   } else {
  //     //??????????????????
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
   * ???????????????(??????????????????)
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
   * ?????????????????????
   * @param selecterName string        ??????????????? 
   * @param items        array<string> ??????????????????
   * @param firstName    string        ??????????????????????????? EX:??????XX ????????? ?????????????????????????????????????????????????????????
   * @param defaultName  string        ???????????????????????? ????????? ????????????????????????????????????????????????
   */
  private createScrollSelecter(selecterName, items, firstName = null, defaultName = null) {
    //????????????
    let self = this;
    //???????????????????????????(??????)
    let orgScrollItems;

    if (firstName) { //????????????????????????
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
    } else {  //???????????????????????????
      orgScrollItems = items.map((item, index) => {
        return {
          deg: index * 30,
          name: item,
          count: index
        }
      });
    }

    //??????????????? ?????????????????????(12???)
    let scrollItems = [];
    for(let i = 0; i < 12; i++) {
      scrollItems.push({
        name: '',
        index: i
      })
    }

    //?????????????????????index
    let defaultIndex = 0;
    if (defaultName) {
      for (let i = 0; i < orgScrollItems.length; i++) {
        if (orgScrollItems[i].name == defaultName) {
          defaultIndex = i;
          break;
        }
      }
    }
    //?????? ???????????????????????????(12???)
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
    // ?????????????????????
    let deg = `rotateX(${(defaultIndex + 1) * 30}deg)`;

    return {
      //?????????????????????
      cd: this.cd,
      //????????????
      self: self,
      //???????????????????????????callback
      onChange: this.onSelecterChange,
      //???????????????
      name: selecterName,
      //?????????????????????
      deg: deg,
      //???????????????????????????(??????)
      orgScrollItems: orgScrollItems,
      //??????????????????????????????index
      nowSelectedIndex: defaultIndex,
      //??????????????? ?????????????????????(12???)
      scrollItems: scrollItems,
      /**
       * ???????????????????????????????????????
       */
      getSelecterValue: function() {
        return {
          value: this.orgScrollItems[this.nowSelectedIndex].name,
          index: this.nowSelectedIndex
        };
      },
      /**
       * ??????????????????
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
          if (Math.abs(((shiftY - clientY) * 0.3) - change) > 5) { //????????????
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
       * ?????????????????????
       */
      changeDeg: function(change) {
        let nowDeg = (this.nowSelectedIndex + 1) * 30 + change;
        if (nowDeg < 30) nowDeg = 30;
        else if (nowDeg > this.orgScrollItems.length * 30) nowDeg = this.orgScrollItems.length * 30
        this.deg = `rotateX(${nowDeg}deg)`;
        this.cd.markForCheck();
      },
      /**
       * ??????????????????????????????
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
   * ??????(??????)??????
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
   * ??????????????????
   */
  getCountdownTime() {
    return this.activePlays === Play.grounder ? 10 : 60;
  }
  /**
   * ????????????
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
   * ???????????????????????????
   */
  getDetailAry(ball) {
    return this.playStatus.play === Play.grounder ? ball.REdetailAry : ball.detailAry;
  }
  /**
   * ??????
   */
  keepUpdate() {
    setTimeout(() => {
      if (this.updateCountdown > 0) {
        this.updateCountdown--;
      }
      if (this.updateCountdown <= 0) { //?????????????????????????????????
        this.updateGameData();
        this.updateCountdown = this.getCountdownTime();
      }
      this.cd.markForCheck();
      this.isAlive && this.keepUpdate();
    }, 1000);
  }
  /**
   * ???????????????????????????
   */
  selectToggle(idx) {
    this.select = (this.select === idx) ? -1 : idx;
    if (this.select >= 0) {
    }
  }
  /**
   * ?????????????????????????????????????????????
   */
  getActiveLeagues() {
    return this.searchLeagueOptions.filter(item => item.active).length;
  }
  /**
   * ???????????????????????????????????????????????????
   */
  chooseAllLeagues() {
    for (let i = 0; i < this.searchLeagueOptions.length; i++) {
      this.searchLeagueOptions[i].active = false;
    }
  }
  /**
   * ???????????????????????????
   */
  toTimeTable() {
    if(DEFAULT.isCN) {
      window.open('http://wcup.ba88soft.com/cnimg2018-1.jpg', '_blank');

    } else {
      window.open('http://wcup.ba88soft.com/img2018-1.jpg', '_blank');
    }
  }
  /**
   * ???????????????????????????
   */
  numberToChar(index) {
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'][index];
  }
  /**
   * 32???8 - ????????????
   * @param country ????????????
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
   * ??????????????????????????????
   */
  isPicked(country) {
    return (!this.pick8Result.hadBet) && this.pick8Ary.indexOf(country) >= 0;
  }
  /**
   * ???32???8?????????????????????
   */
  pick8clear() {
    this.pick8Ary = [];
  }
  /**
   * ??????32???8??????
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
   * ???????????????32???8????????????
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
   * ??????32???8????????????
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
   * ??????32???8??????????????????
   */
  getConfirmBtnTxt() {
    if (this.pick8Ary.length < 8) {
      return this.getLeftText(this.pick8Ary.length);
    }
    return {'zh-tw': '??????', 'zh-cn': '??????', 'ja-jp': '??????'}[this.configSet.lang];
  }
  /**
   * ??????32???8??????
   */
  getLeftText(count) {
    switch(this.configSet.lang) {
      case 'zh-tw':
        return `??????(${count}/8)???`;
      case 'zh-cn':
        return `??????(${count}/8)???`;
      default:
        return count + '/8';
    }
  }
  /**
   * ??????????????????32???8
   */
  isCanBetPick8() {
    return this.pick8Ary.length === 8;
  }
  /**
   * ????????????????????????
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
  /**????????? */
  getBallList(){
    this.ballQuantity.getBallQuantity().subscribe(arr => {
      this.ballList = arr;
    });
   
  }
  /**
   * ?????? ????????????
   * @param _ball ???
   */
  market(_ball){
    //this.changePlay();
    this.changeBall(_ball);  //?????????

    this.marketPage = !this.marketPage;


    this.gameSwitchData['beginner'] = this.configSet.beginner;
    this.gameSwitchData['orderLeague']  = this.configSet.orderLeague;
    this.gameSwitchData['bet']  = this.configSet.openHKodd;
    this.gameSwitchData['white']  = this.configSet.night;

    
  }
  /**
   * ??????????????????
   * @param _play ??????
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
   * ??????????????????
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
  /**???????????? */
  backHome(){
    this.marketPage = false;
    this.SwitchPlay =  false;
    this.changeBall(null);
  }
  /**
   * ??????????????????
   * @param finish ????????????
   */
  checkOrders(finish) {
    this.finishOrder = finish;
    this.ordersActive = true;
  };
  /**
   * ??????????????????
   */
  public closeOrders() {
    this.ordersActive = false;
  }
  /**
   * ????????????????????????
   * @param gameData ????????????
   */
  public showGameDetail(gameData, type, ball) {
    this.gameDetailData = gameData;
    this.detailType = type;
    this.detailBall = ball;
    this.gameDetailActive = true;
  }
  /**
   * ??????????????????
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
   * ????????????????????????
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
   * ????????????-????????????
   * <game-switch> ????????????
   * @param _data Output?????????callSwitch.emit(_d) ["beginner", true]
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
