// Angular
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// App
import { LoginAppService } from '@service/login-app.service';
// RxJS
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/shareReplay';
import 'rxjs/add/observable/throw';

import { TransAPIService } from 'ts/translate-value';
import { ConfigSetService } from '@app/service/config-set.service';
import { DEFAULT } from '@app/app.config';
import { ProcessingCircleStatusService } from '@app/service/status-processing-circle.service';
import { UidStatusService } from '@app/service/status-uid.service';
import { DialogStatusService } from '@app/service/status-dialog.service';


export interface APIResponse {
  /** 回傳狀態 */
  err: boolean;
  /** 回傳訊息 */
  err_msg: string;
  /** 回傳資料 */
  ret: any;
}
@Injectable()
export class ApiService {
  private lang = this.configSet.lang;
  // 目前還在執行中的http request
  ProcessingPost = [];
  // 目前是否還有執行中且有要求讀取圈顯示的http request
  checking = false;
  // 同一隻http request最大等待時間
  defaultCountDown = 30; //基礎倒數30秒
  // 是否取消alert致能(不要重複顯示被登出的alert)
  alertDisable = false;

  constructor(
    private http: HttpClient,
    private loginApp: LoginAppService,
    private configSet: ConfigSetService,
    private pcStatus: ProcessingCircleStatusService,
    private dialog: DialogStatusService
    ) { }
	/**
	 * HTTP Request
	 * @param code gateway 代號
	 * @param req  gateway 請求資料
   * @param processingCircle 是否要執行讀取圈顯示
	 */
  postServer(code: number, req: Object | any, processingCircle = true): Observable<APIResponse> {
    
    const url = DEFAULT.SERVER_PATH + '?cmd=' + code;

    const body = this.formatPostBody({
      cmd: JSON.stringify({ cmd: code, parame: req })
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8;'
    });
    processingCircle && this.pushPost(code);
  
    if (!this.checking) {this.checkNext()}; //若目前沒有執行中的http request 則開始執行檢查

    return this.http.post(url, body, { headers, responseType: 'text' })
      .retry(2).timeout(30000)
      .map(text => {
        processingCircle && this.removePost([code]);
        try {
           const resData: APIResponse = eval('(' + text + ')');

            if (!!!resData.err) {
              this.errProcess(code, resData.err_msg, code, req);
            }
            return resData || {};
          } catch (e) {
            console.log('error:' + code, req);
            console.log(e);
            return  {};
        }
      })
      .catch((error) => Observable.throw(error || 'Server error'))
      .shareReplay();
  }
  post(url: string, req: Object | any, processingCircle = true): Observable<APIResponse> {
    
    let postUrl = url + '?';

    const body = this.formatPostBody(req);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8;'
    });
  
    if (!this.checking) {this.checkNext()}; //若目前沒有執行中的http request 則開始執行檢查

    return this.http.post(url, body, { headers, responseType: 'text' })
      .retry(2).timeout(30000)
      .map(text => {
        const resData = {}
        try {
          const resData: APIResponse = eval('(' + text + ')');
          }
          catch (e) {
              console.log(e);
          }
      
        return resData || {};
      })
      .catch((error) => Observable.throw(error || 'Server error'))
      .shareReplay();
  }
  /**
   * 將新的http request加入執行中列表
   * @param cmd gateway 編號
   */
  private pushPost(cmd) {
    if (this.ProcessingPost.filter(item => item.cmd === cmd).length === 0) {
      this.ProcessingPost.push({
        cmd: cmd,
        countDown: this.defaultCountDown
      })
    }
    this.pcStatus.open();
  }
  /**
   * 將http request 從列表中移除
   * @param cmdAry gateway 編號 陣列
   */
  private removePost(cmdAry) {
    cmdAry.forEach(cmd => {
      for(let i = 0; i < this.ProcessingPost.length; i++) {
        if (this.ProcessingPost[i].cmd === cmd) {
          this.ProcessingPost.splice(i, 1);
        }
      }
    });
    if (this.ProcessingPost.length === 0) {
      this.pcStatus.close();
    }
  }
  /**
   * 檢查是否還有未執行完的http request 若還有且該http request執行超過30秒 則從列表中移除
   */
  private checkNext() {
    this.checking = true;
    setTimeout(() => {
      this.ProcessingPost = this.ProcessingPost.map(item => {
        item.countDown--;
        return item;
      }).filter(item => item.countDown > 0);
      if (this.ProcessingPost.length > 0) {
        this.checkNext();
      } else {
        this.pcStatus.close();
        this.checking = false;
      }
    }, 1000);
  }
	/**
	 * 序列化 postServer 請求的 body
	 * @param data 序列化值
	 */
  private formatPostBody(_data: any) {
    let formatData = '';
    let count = 0;
    for (const i in _data) {
      if (_data) {
        if (count === 0) {
          formatData += i + '=' + _data[i];
        } else {
          formatData += '&' + i + '=' + _data[i];
        }
        count++;
      }
    }
    return formatData;
  }
  /**
   * 將alert致能
   */
  resetAlert() {
    this.alertDisable = false;
  }
	/**
	 * post錯誤
	 * @param code
	 * @param errMsg
	 */
  private errProcess(code: number, errMsg: string,code1 = -1, req = {}) {
    if (!this.alertDisable) {
      switch (errMsg) {
        case 'logout':
          this.dialog.alert(TransAPIService[this.lang]['Logout']);
          this.loginApp.logout();
          this.alertDisable = true;
          break;
        case 'unknow uid':
          this.dialog.alert(TransAPIService[this.lang]['Expired'] + ' code : ' + code1 + 'D' + req['uid']);
          this.loginApp.logout();
          this.alertDisable = true;
          break;
        default:
          if (code === 308 || code === 350) {
            this.dialog.alert(errMsg);
          } else {
            console.log(code + ': ' + errMsg);
          }
          break;
      }
    }
  }
}
