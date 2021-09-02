import {
  Component, OnChanges, Input, OnDestroy, OnInit,
  ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef
} from '@angular/core';
import { ChatService, IMsg } from '../chat.service';
import { useAsync } from 'lib/helper';
import { MemberService } from '@app/service/store-member.service';
import { UnSubscribe } from 'lib/ng-component';
import 'rxjs/add/operator/takeWhile';
const publicHall = '_public';
import { DialogStatusService } from '@app/service/status-dialog.service';
import { ConfigSetService, Lang } from '@service/config-set.service';
import { TransLog } from 'ts/translate-value';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements OnChanges, OnDestroy, OnInit {
  @Input() isPlatform: boolean;
  // 是否為大廳
  @Input() isLobby: boolean;
  // 公房的ID
  @Input() publicRoomID: string;
  // 最新的聊天訊息
  @Input() 
  set newMsg(newMsg: any) {
    if (!this.chatService.msgOpen && newMsg) {
      this._newMsg.push(newMsg);
    }
  }
  // 新的聊天訊息陣列
  _newMsg: Array<any> = [];
  // 是否還存在
  alive:boolean = true;
  // 房間名字輸入格
  searchKey: string = '';
  // 自己目前所賦予的聊天室mid
  chid = -1;
  // 是否開啟 新增私人聊天室 視窗
  isRoomOpenActive: boolean = false;
  // 是否開啟 私人聊天室設定 視窗
  isRoomOptionActive: boolean = false;
  // 是否正在focus在訊息輸入框上
  inputFocusing: boolean = false;

  isPrivateChat: boolean = false;


  @ViewChild('chat') private chat: ElementRef;
  @ViewChild('chatInput') private chatInput: ElementRef;
  @ViewChild('chatBillboard') private chatBillboard: ElementRef;

  constructor(
    private member: MemberService,
    public chatService: ChatService,
    private cd: ChangeDetectorRef,
    private configSet: ConfigSetService,
    private dialog: DialogStatusService
    ) { 
    this.chatService.currentRoom$.takeWhile(()=>this.alive).subscribe(cr => {
      if (cr.protocol === 3) { //進行登入
        this.chid = cr.data.mid;
      } else if (cr.protocol === 19 || cr.protocol === 20 || cr.protocol === 22) {
        this.isRoomOptionActive = false;
        this.isRoomOpenActive = false;
      }
      this.cd.markForCheck();
    })
  }
  ngOnInit() {
    if (!this.isLobby && this.isPublicRoom()) { //如果進入賽事直播頁面且不再私房內 則自動加入直播聊天室
      this.chatService.addRoom(this.publicRoomID, true);
      this.chid = this.chatService.chid;
    }
  }
  ngOnChanges() {
    this.scrollBottom();
  }
  ngOnDestroy() {
    this.alive = false;
    if (!this.isLobby && this.isPublicRoom()) {
      this.chatService.addRoom(publicHall);
    }
  }
  /**
   * 將聊天內容畫面置底 (顯示最新的聊天內容)
   */
  private scrollBottom() {
    useAsync(() => {
      this.chatBillboard.nativeElement.scrollTop =
        this.chatBillboard.nativeElement.scrollHeight - 1;
      this.cd.markForCheck();
    });
  }
  /**
   * 取得會員icon
   * @param userName 
   */
  getUserIconNumber(userName) {
    if (userName && userName.length > 0) {
      return (userName.charCodeAt(userName.length - 1) % 8) + 1;
      // return (userName.length % 8) + 1;      
    }
    return 1;
  }

  /**
   * 發送訊息
   * @param msg 
   */
  sendMessage(msg: string) {
    if (msg.trim() === '') { return; }
    this.chatService.addMessage(msg, this.isPrivateChat);
    this.chatInput.nativeElement.value = '';
    this.chatInput.nativeElement.focus();
    this.cd.markForCheck();
  }

  /**
   * 點擊focus訊息輸入框
   */
  focusInput() {
    this.showMessages();//顯示聊天內容
    let nowChat = this.isLobby ? 'chatBillboard' : 'chatBillboard2';
    this.inputFocusing = true;
    this.cd.markForCheck();
    setTimeout(()=>{ //調整聊天室高度
      $('#' + nowChat).height($(window).height() - $(window).scrollTop() -  225) ;
      this.cd.markForCheck();
    }, 500);
  }
  /**
   * 從訊息輸入框上移開focus
   */
  blur(){
    let nowChat = this.isLobby ? 'chatBillboard' : 'chatBillboard2';
    setTimeout(()=>{ //調整聊天室高度
      if (jQuery(':focus').prop('id') && jQuery(':focus').prop('id') === 'chatInput') return;
      this.inputFocusing = false;
      if (this.isLobby) {
        $('#' + nowChat).height($(window).height() * 0.4);
      } else {
        $('#' + nowChat).height($(window).height() - $('#LiveVideo').height() - 360);
      }
      this.cd.markForCheck();
    }, 500);
  }
  /** 
   * 顯示聊天內容
   */
  showMessages() {
    // this.msgOpen = true;
    this.chatService.setMsgOpen(true);
    this._newMsg = [];
  }
  /**
   * 隱藏聊天內容
   */
  hideMessages() {
    $('#chatBillboard').height(0);
    $('#chatBillboard2').height(0);
    this.chatService.setMsgOpen(false);
    // this.msgOpen = false;
  }
  /**
   * 開啟私房設定視窗
   */
  toggleRoomOption() {
    this.searchKey = '';
    this.isRoomOpenActive = true;
  }

  /**
   * 創建私房
   */
  createRoom() {
    this.chatService.createRoom(this.searchKey);
    this.searchKey = '';
    this.isRoomOpenActive = false;
  }
  /**
   * 切換到公用房間
   */
  changePublicOrPrivate(status) {
    this.isPrivateChat = status;
    this.scrollBottom();
  }
  

  isRoomSelectedClass(room) {
    return room.key === this.chatService.nowPrivateRoom.key ? 'selected' : '';
  }

  ExitRoom() {
    this.dialog.confirm(TransLog[this.configSet.lang].LeaveRoomName(this.chatService.nowPrivateRoom.name), () => {
      this.chatService.exitRoom(this.chatService.nowPrivateRoom.key);
      this.isRoomOptionActive = false;
    });
  }

  kickMember(member) {
    this.dialog.confirm(TransLog[this.configSet.lang].KickMember(member.name), () => {
      this.chatService.kickMember(member.ac);
    })
  }

  isDeleteMsg(message) {
    if (!this.chatService.isHost()) {
      return;
    }
    let showMsg = message.msg;
    if (showMsg.length > 10) {
      showMsg = showMsg.substring(0, 5) + '...' + showMsg.substring(showMsg.length - 4);
    }
    this.dialog.confirm(TransLog[this.configSet.lang].DeleteMsg(showMsg), () => {
      this.chatService.deleteMsg(message);
    })
    // if (confirm("刪除訊息 '" + message.msg + "' ?" )) {
    //   this.chatService.deleteMsg(message);
    // }
  }
  /**
   * 選擇目前私房
   */
  selectPrivateRoom(room) {
    this.chatService.setNowPrivateRoom(room.key);
    this.scrollBottom();
  }

  /**
   * 判斷目前是否在公用房間
   */
  isPublicRoom() {
    return this.chatService.isPublic;
    // return !/^[\dA-Z]{7}$/.test(this.chatService.key);
  }
  /**
   * 加入私房
   */
  joinRoom() {
    if (this.searchKey.length == 0) return;
    this.chatService.addRoom(this.searchKey);
    this.searchKey = '';
    this.isRoomOpenActive = false;
  }
  /**
   * 加入歷史私房
   */
  joinRoomHistory(key) {
    if (this.chatService.key === key) return;
    this.chatService.addRoom(key);
    this.isRoomOpenActive = false;
  }
  /**
   * 複製目前私房的key
   */
  textCopy(text = '') {
    if (!this.isPrivateChat) return;
    $('body').append('<textarea id="clip_area"></textarea>');
    
    var clip_area = $('#clip_area');
      
    clip_area.text(this.chatService.nowPrivateRoom.key);
    // clip_area.text(text);
    clip_area.select();
  
    document.execCommand('copy');
    
    clip_area.remove();
    this.dialog.alert(TransLog[this.configSet.lang]['Copy']);
  }
  /**
   * 刪除/新增 禁言人員
   * @param name 
   */
  addToBanList(key, msg) {
    if (msg.ac === this.chatService.ac) return;
    if (!this.isBan(key, msg.ac)) {
      this.dialog.confirm(TransLog[this.configSet.lang].SureBan(msg.name), () => {
        this.chatService.addToBanList(key, msg.ac);
      })
    }
  }
  /**
   * 判斷該員是否在禁言內
   * @param name 
   */
  isBan(key, ac) {
    return this.chatService.isBan(key, ac)
    // return this.chatService.banList[name];
  }
  /**
   * 點擊新訊息的浮動圖示 顯示聊天內容
   */
  checkNewMsg() {
    if (this.isLobby) {
      $('#chatBillboard').height($(window).height() * 0.4);
    } else {
      $('#chatBillboard2').height($(window).height() - $('#LiveVideo').height() - 360);
    }
    this.showMessages();
    this.cd.markForCheck();
  }
}
