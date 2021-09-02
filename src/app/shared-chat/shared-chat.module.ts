import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ChatComponent } from './chat/chat.component';
import { FormsModule } from '@angular/forms';
// import { ChatService } from './chat.service';
@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule
  ],
  declarations: [ChatComponent],
  exports: [ChatComponent],
  // providers: [ChatService]
})
export class SharedChatModule { }
