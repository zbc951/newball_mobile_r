// Angular
import { Injectable } from '@angular/core';

import { DEFAULT } from '@app/app.config';
import { Ball } from '@app/ts/ball';

import { TranslateService } from '@ngx-translate/core';
import { LocalStorage } from 'lib/storage';
import { ReplaySubject } from 'rxjs/ReplaySubject';;
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
export enum Lang { TW = 'zh-tw', CN = 'zh-cn', JP = 'ja-jp', VI = 'vi' }

@Injectable()
export class ConfigSetService {
  // 是否已經設置預設
  private isDefault: boolean = false;
  // 系統球種
  private _ball: Ball = LocalStorage.getItem('ball') || DEFAULT.BALL as Ball;
  // 系統語言
  private _lang: Lang = LocalStorage.getItem('lang') || DEFAULT.LANG as Lang;
  //監聽語言變更
  private langChangeSubject = new ReplaySubject<Lang>(1);


  langChange$ = this.langChangeSubject.asObservable();
  // 是否已經設置語言預設
  private isLangSetInit: boolean = false;

  // 夜間模式
  private _nightMode: boolean = ((LocalStorage.getItem('night') == null) ? DEFAULT.NIGHT_MODE : LocalStorage.getItem('night')) as boolean;

  //香港賠率
  private _HKodd: boolean = ((LocalStorage.getItem('hko') == null) ? DEFAULT.HKO : LocalStorage.getItem('hko')) as boolean;

  //新手版-專業版
  private _beginner: boolean = DEFAULT.BEGINNER as boolean;
  //聯盟-時間
  private _orderLeague: boolean = DEFAULT.LENGHT as boolean;
  //可讀 香港賠率 
  public openHKodd: boolean = ((LocalStorage.getItem('hko') == null) ? DEFAULT.HKO : LocalStorage.getItem('hko')) as boolean;

  private HKoddInfoSubject: BehaviorSubject<boolean> = new BehaviorSubject(this._HKodd);
  //預設基本盤
  HKodd$: Observable<boolean> = this.HKoddInfoSubject.asObservable();

  constructor(
    private translate: TranslateService,
  ) { 
    if (this._nightMode) {
      $('body').addClass('dk');
    } else {
      $('body').removeClass('dk');
    }
  }

  defaultSet() {
    if (this.isDefault) { return; }
    this.lang = this._lang;
    this.isDefault = true;
  }
  get lang(): Lang {

    return this._lang;
  }
  set lang(lang: Lang) {

    this._lang = lang;
    this.translate.use(lang);

    if (this.isLangSetInit) {
      this.langChangeSubject.next(lang);
    }
    this.isLangSetInit = true;
  }
  saveLang(lang: Lang) {
    this.lang = lang;
    LocalStorage.setItem('lang', lang);
  }
  get ball(): Ball {
    return this._ball;
  }
  set ball(ball: Ball) {
    this._ball = ball;
    LocalStorage.setItem('ball', ball);
  }
  get night(): boolean {
    return this._nightMode;
  }
  set night(nightMode: boolean) {
    this._nightMode = nightMode;
    LocalStorage.setItem('night', nightMode);
    if (nightMode) {
      $('body').addClass('dk');
    } else {
      $('body').removeClass('dk');
    }
  }
  get beginner(): boolean  {
    return this._beginner;
  }
  set beginner(_val: boolean ) {
    this._beginner = _val;
  }
  get orderLeague(): boolean  {
    return this._orderLeague;
  }
  set orderLeague(_val: boolean ) {
    this._orderLeague = _val;
  }

  setOdd(_bet) {
    this.HKoddInfoSubject.next(_bet);
    this.openHKodd = _bet;
    LocalStorage.setItem('hko', _bet);
  }

}
