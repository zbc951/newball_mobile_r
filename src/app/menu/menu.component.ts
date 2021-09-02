// Angular
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
// Service
import { StatusMenuService } from '@service/status-menu.service';
import { LoginBackService } from '@service/login-back.service';
import { BallQuantityService } from '@service/ball-quantity.service';
import { BallStatusService } from '@service/status-ball.service';
import { PlayStatusService } from '@service/status-play.service';
// RxJS
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromEvent';

import { Play } from 'ts/play';
import { appBalls, IAppBalls, Ball } from 'ts/ball';
import { RouterPath } from '@app/app.config';
import { objCopy, useAsync } from 'lib/helper';
import { UidStatusService } from '@service/status-uid.service';
import { ApiService } from '@service/api.service';

import { PlatformRef } from '@angular/core/src/application_ref';
import { UnSubscribe } from 'lib/ng-component';
import { DEFAULT } from '@app/app.config';
import { SessionStorage } from 'lib/storage';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent extends UnSubscribe implements OnInit {
  isCashVer = DEFAULT.isCashVer;
  moviePath = DEFAULT.MOVIE_PATH;
  hasMovie = DEFAULT.HAS_MOVIE;
  hasRule = DEFAULT.HAS_RULE;
  LimitTypes = DEFAULT.LimitTypes || [];
  RouterPath = RouterPath;
  ballList: any;
  Play = Play;
  @ViewChild('menu') private menu: ElementRef;
  constructor(
    public statusMenu: StatusMenuService,
    private api: ApiService,
    private router: Router,
    private loginBack: LoginBackService,
    private ballQuantity: BallQuantityService,
    private ballStatus: BallStatusService,
    private playStatus: PlayStatusService,
    private uidStatus: UidStatusService,
    private cd: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this.appBalls$();
    this.statusMenu.isOpen$.subscribe(isOpen => {
      if (isOpen) { this.openMenu(); }
    })
  }
  toTC() { //開啟TC老虎機頁面
    this.closeMenu();
    if (this.uidStatus.uid) {
      window.open('http://web.nk999.net/app/slotMain.php?uid=' + this.uidStatus.uid);
    } 
  }
  toReal() {//開啟真人頁面
    if (this.uidStatus.uid) {
      this.api.postServer(252, {uid: this.uidStatus.uid})
      .subscribe(data => {
        this.closeMenu();
        window.open(data.ret['gmurl']);
      });
    }
  }
  /**
   * 前往遊戲大廳並預先設置球種及玩法
   * @param ball 球種
   * @param play 玩法
   * @param count 該玩法球種的賽事數量
   */
  goLobby(ball: Ball, play: Play, count: number | string) {
    if (Number(count) === 0) { return; }
    this.router.navigate(RouterPath.lobby);
    this.statusMenu.close();
    this.ballStatus.ball = ball;
    this.playStatus.play = play;
    this.closeMenu();
  }
  //前往影城頁面
  goMovie() {
    if (this.uidStatus.uid) {
      window.open(this.moviePath);
    } else {

    }
    this.closeMenu();
  }
  //登出
  logout() {
    this.loginBack.logout();
  }
    //登出
    goPCweb() {
      SessionStorage.setItem('loginUid', this.uidStatus.uid);
      setTimeout(() => {
        location.href='/?uid='+this.uidStatus.uid+'&ispc=Y';
      },500);
     
    }

  appBalls$() {

    const formatQuantity = (quantity) => {
      return Observable.from(objCopy(appBalls) as IAppBalls[])
        .map(ball => {
          const ballQuantity = quantity[ball.value];
          ball['R_count'] = Number(ballQuantity.ALL);
          ball['RE_count'] = Number(ballQuantity.RE);
          ball['MPR_count'] = Number(ballQuantity.MPR);
          return ball;
        })
        .toArray()
    };

    this.ballQuantity.getBallQuantity().switchMap(formatQuantity)
      .subscribe(arr => {
        this.ballList = arr.map(ball => {
          ball['menuShow'] = ball['R_count'] || ball['RE_count'] || ball['MPR_count']
         
          return ball;
        }).filter(b => {
          if (this.LimitTypes.indexOf(b.value) >= 0) {
            return false;
          }
          return true;
        });
        
        this.cd.markForCheck();
      });
  }

  openMenu() {
    // setTimeout(() => {
    //   this.menu.nativeElement.classList.add('trans');
    // }, 0);
  }

  closeMenu() {
    // this.menu.nativeElement.classList.remove('trans');
    setTimeout(() => { this.statusMenu.close(); }, 0);
  }
}
