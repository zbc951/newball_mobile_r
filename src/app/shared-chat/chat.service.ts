// Angular
import { Injectable } from '@angular/core';
// App
import { DEFAULT } from '@app/app.config';
import { UidStatusService } from '@service/status-uid.service';
// Socket IO
import * as io from 'socket.io-client';
import { ApiService } from '@service/api.service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { objCopy } from 'lib/helper';
import { now } from 'moment';
import { DialogStatusService } from '@app/service/status-dialog.service';
import { ConfigSetService, Lang } from '@service/config-set.service';
import { TransLog } from 'ts/translate-value';

export interface IMsg {
  user: string; 
  msg: string; 
}
export interface IRoom {
  name: string; 
  online: number;
  newestMsg: IMsg;
  history: IMsg[];
  vote_H: number;
  vote_G: number;
}
export interface IVoting {
  name: string;
  votingSide: VoteSide;
}
export enum VoteSide {
  home = 'H',
  guest = 'G',
}
@Injectable()
export class ChatService {
  // 連結的socket
  private socket;
  
  // 監聽所有房間的目前人數
  private everyRoomSub: ReplaySubject<any> = new ReplaySubject(1);
  everyRoom$ = this.everyRoomSub.asObservable();

  // 監聽目前房間的訊息等
  private currentRoomSub: ReplaySubject<any> = new ReplaySubject(1);
  currentRoom$ = this.currentRoomSub.asObservable();

  // 監聽投票人數
  private votingSub: ReplaySubject<any> = new ReplaySubject(1);
  voting$ = this.votingSub.asObservable();

  // 目前房間的key
  key = '_public';
  // 聊天室內容
  messages = [];
  // 目前聊天室人數
  online = 0;
  // 在聊天室 自己的member id
  chid = -1;
  // 在聊天室的帳號
  ac = '';
  // 自己在聊天室的名稱
  uname = '';
  // 目前是否在公開頻道
  isPublic = true;
  // 儲存的私人聊天室列表
  privateRoomList = [];
  // 最新(未讀取)的訊息 (聊天畫面沒有展開時才會存放在這
  newMsgs = [];
  // 禁言清單
  banList = {};
  // 目前是否展開聊天畫面
  msgOpen = false;
  // 目前嘗試加入的房間key
  tmpAddKey = '';
  // 目前所在的私房key
  nowPrivateRoom = {
    key: '',
    messages: [],
    name: '',
    online: 0,
    members: [],
    host: '',
    hasNewMsg: false
  };

  constructor(
    private uidStatue: UidStatusService,
    private api: ApiService,
    private dialog: DialogStatusService,
    private configSet: ConfigSetService,
    ) {
    //連接socket
    // this.socket = io((DEFAULT.CHAT_SERVER_TYPE === 'https') ? DEFAULT.CHAT_SERVER_HTTPS : DEFAULT.CHAT_SERVER);
    // this.chatSubscriber();
  }

  /**
   * 登入/更新自己在聊天室的名稱
   * @param name 要改的名稱
   */
  public updateUserName(username, name) {
    this.emitEvent(3, {
      account: username,
      name: name
    });
  }

  /**
   * 要求目前聊天室人數
   */
  public getOnlines() {
    this.emitEvent(101,{});
  }

  /**
   * 加入聊天室
   * @param room 聊天室的key
   * @param create 若要加入的房間不存在,是否強制創建新的聊天室
   */
  addRoom(room: string, create:boolean = false) {
    this.tmpAddKey = room;
    this.emitEvent(6, {
      key: room,
      create: create
    });
  }

  /**
   * 創建新聊天室
   * @param name 新聊天室的名稱
   */
  createRoom(name = '') {
    this.emitEvent(2, {name: name});
  }

  /**
   * 送出訊息
   * @param msg 要送的訊息
   */
  addMessage(msg: string, privateRoom = false) {
    if (privateRoom) {
      if (this.nowPrivateRoom && this.nowPrivateRoom.key) {
        this.emitEvent(4, {
          key: this.nowPrivateRoom.key,
          msg: msg
        });
      }
    } else {
      this.emitEvent(4, {
        key: this.key,
        msg: msg
      });
    }
  }

  /**
   * 設定目前所在的私房
   * @param key 要設定的房間的key
   * @returns 是否切換成功 
   */
  setNowPrivateRoom(key) {
    for (let i = 0; i < this.privateRoomList.length; i++) {
      if (this.privateRoomList[i].key === key) {
        this.nowPrivateRoom = this.privateRoomList[i];
        this.nowPrivateRoom.hasNewMsg = false;
        return true;
      }
    }
    return false;
  }

  /**
   * 要求聊天室的投票數量
   * @param key 要要求的聊天室key
   */
  getVote(key) {
    this.emitEvent(102, {key: key});
  }

  /**
   * 投票
   * @param key 要投票的聊天室key
   * @param side 要投的選項
   */
  addVote(key, side: VoteSide) {
    this.emitEvent(103, {key: key, side: side});
    
    // const param = [this.uidStatue.uid, side];
    // this.socket.emit('add-vote', ...param);
  }

  exitRoom(key) {
    if (key) {
      this.emitEvent(20, {key: key});
    }
  }

  /**
   * 發送資料與聊天server溝通
   * @param protocol 執行代號
   * @param data 附加資料
   */
  emitEvent(protocol, data) {
    let sendData = {
      protocol: protocol,
      data: data
    }
    this.socket && this.socket.emit('data', JSON.stringify(sendData));
  }

  isHost(account = '') {
    if (account) {
      return account === this.ac;
    } else {
      return this.nowPrivateRoom.host === this.ac;
    }
  }

  kickMember(ac) {
    this.emitEvent(22, {key: this.nowPrivateRoom.key,  ac: ac})
  }
  
  deleteMsg(msg) {
    this.emitEvent(23, {key: this.nowPrivateRoom.key, ids: [msg.id]});
  }

  //取得所有房間
  // getRoomList() {
  //   this.emitEvent(218, {
  //   });
  // }

  //處理socket接收資料
  private chatSubscriber() {
    this.socket.on('data', (data) => {
      try {
        data = JSON.parse(data);
        // console.log(data);
        switch(data.protocol) {
          case 3: //登入後資訊
            this.chid = data.data.mid;
            this.uname = data.data.name;
            this.ac = data.data.ac;
            this.getBanList();
            break;
          case 4: //接收到訊息
            if (!this.isBan(data.data.key, data.data.ac)) {
              let newmsg = {
                ac: data.data.ac,
                mid: data.data.mid,
                msg: data.data.msg,
                name: data.data.name,
                time: data.data.time,
                timestamp: data.data.timestamp,
                id: data.data.id
              };
              if (data.data.isPublic) {
                this.messages.push(newmsg);
                this.messages = objCopy(this.messages);
              } else {
                let rom;
                for (let i = 0; i < this.privateRoomList.length; i++) {
                  if (this.privateRoomList[i].key === data.data.key) {
                    rom = this.privateRoomList[i];
                    break;
                  }
                }
                if (rom) {
                  rom.messages.push(newmsg);
                  if (rom.key !== this.nowPrivateRoom.key) {
                    rom.hasNewMsg = true;
                  }
                } else {
                  console.log('找不到房間(訊息)');
                }
              }

            } 
            break;
          case 8: //自己加入了新聊天室
            if (!data.data.room.isPublic) { //將聊天室key加入私人聊天室列表
              let found = this.privateRoomList.filter(room => room.key === data.data.room.key).length;
              if (!found) {
                // this.privateRoomList.push(data.data.room.key);
                this.privateRoomList.push({
                  messages: this.filterBans(data.data.room.key, data.data.room.history),
                  key: data.data.room.key,
                  members: data.data.room.members,
                  name: data.data.room.name,
                  online: data.data.room.online,
                  host: data.data.room.host,
                  hasNewMsg: false
                });
              }
            } else {
              this.online = data.data.room.online;
              this.key = data.data.room.key;
              this.isPublic = data.data.room.isPublic;
              this.messages = this.filterBans(this.key, objCopy(data.data.room.history));
            }

            break;
          case 7: //有人離開自己所在的聊天室
          case 6: //有人加入自己所在的聊天室
            if (!data.data.room.isPublic) { //將聊天室key加入私人聊天室列表
              let found = this.privateRoomList.map(rom => rom.key).indexOf(data.data.room.key);
              if (found >= 0) {
                this.privateRoomList[found].members = data.data.room.members;
                this.privateRoomList[found].online = data.data.room.online;
              }
            } else {
              this.online = data.data.room.online;
            }
            break;
          case 19: //已經退出房間
          case 20:  //房間已經刪除
          case 22: //從房間內被移除
            let found = this.privateRoomList.map(rom => rom.key).indexOf(data.data.key);
            if (found >= 0) {
              this.privateRoomList.splice(found, 1);
            }
            if (data.data.key === this.nowPrivateRoom.key) {
              this.nowPrivateRoom = {
                key: '',
                messages: [],
                name: '',
                online: 0,
                members: [],
                host: '',
                hasNewMsg: false
              };
              this.dialog.alert(TransLog[this.configSet.lang]['LeaveRoom']);
            }
            break;
          case 23: //訊息刪除
            found = this.privateRoomList.map(rom => rom.key).indexOf(data.data.key);
            if (found >= 0) {
              let room = this.privateRoomList[found];
              room.messages = room.messages.filter(msg => data.data.deleteIds.indexOf(msg.id) < 0);
            } else if (data.data.key === this.key) { //公房
              this.messages = this.messages.filter(msg => data.data.deleteIds.indexOf(msg.id) < 0);
            }
            break;
          case 30: //初始化房間列表 
            this.privateRoomList = data.data.rooms.map(room => {
              return {
                messages: this.filterBans(room.key, room.history),
                key: room.key,
                members: room.members,
                name: room.name,
                online: room.online,
                host: room.host,
                hasNewMsg: false
              }
            });
            break;
          case 100:
            this.dialog.alert(data.data.errLog);
            if (data.data.errCode == 3) {
              for (let i = 0; i < this.privateRoomList.length; i++) {
                if (this.privateRoomList[i] === this.tmpAddKey) { //所儲存的私人聊天室已經不存在
                  this.privateRoomList.splice(i, 1);
                  this.tmpAddKey = '';
                  break;
                }
              }
            }
            break;
          default:
        }

        this.currentRoomSub.next(data); //更新聊天室
        if (data.protocol === 101) { 
          this.everyRoomSub.next(data); //更新大廳各聊天室人數
        } else if (data.protocol === 102) {
          this.votingSub.next(data.data); //更新投票數
        }
      } catch(e) {
        console.log(e);
      }
    });
  }

  /**
   * 展開/縮小聊天畫面
   * @param flag 
   */
  public setMsgOpen(flag) {
    this.msgOpen = flag;
    this.currentRoomSub.next(flag);
  }
  
  /**
   * 加入/移除禁言名單
   * @param name 禁言的會員名稱
   */
  addToBanList(key, ac) {
    if (!this.banList[key]) {
      this.banList[key] = [];
    }

    if (this.banList[key].indexOf(ac) < 0) { //確認不再禁言名單內
      this.banList[key].push(ac);
      this.api.post('http://cs0-web.sog88.net/lives/SuperGateway.php', {
        cmd: 101,
        act: 1,
        ban_username: ac,
        key: key,
        username: this.ac
      }).subscribe(res => {
        // console.log('res', res);
      });
    }
  }
  filterBans(key, messages) {
    if (this.banList[key] && this.banList[key].length > 0) {
      return messages.filter(msg => {
        return this.banList[key].indexOf(msg.ac) < 0;
      })
    }
    return messages;
  }
  /**
   * 取得禁言列表
   */
  getBanList() {
    this.api.post('http://cs0-web.sog88.net/lives/SuperGateway.php', {
      cmd: 100,
      username: this.ac
    }).subscribe(res => {
      // console.log('res', res);
      if (res && res['status'] == "0" && res['data'] && res['data']['bans']) {
        this.banList = res['data']['bans'];
      
        this.privateRoomList.forEach(room => {
          room.messages = this.filterBans(room.key, room.messages);
        })
      }
    });
    // return this.banList;
  }
  /**
   * 是否被禁言
   */
  isBan(key, ac) {
    return this.banList[key] && (this.banList[key].indexOf(ac) >= 0);
  }
}
