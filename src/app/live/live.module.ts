// Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// App
import { SharedCoreModule } from '@shared-core/shared-core.module';
import { SharedChatModule } from '@shared-chat/shared-chat.module';
// App
import { AuthGuardService } from '@service/auth-guard.service';
// Live
import { LiveComponent } from '@live/live.component';
import { LiveService } from '@live/live.service';
import { LiveStoreService } from '@live/live-store.service';
import { PipeGtype,PipeLeague } from './live-pipe.pipe';

const routes: Routes = [
  {
    path: '',
    component: LiveComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [
    SharedCoreModule,
    SharedChatModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    LiveComponent,
    PipeGtype,
    PipeLeague
  ],
  providers: [
    LiveService,
    LiveStoreService
  ]
})

export class LiveModule { }
