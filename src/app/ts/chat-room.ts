import { IRoom, IMsg } from '@shared-chat/chat.service';
import { objCopy } from 'lib/helper';

export interface IVote {
  home: number;
  guest: number;
}
export interface ICurrentChatRoom {
  messages: IMsg[];
  online?: number;
  vote?: IVote;
  key?: string;
}
export function currentProcess(data) {
  this.cd.markForCheck();
}
