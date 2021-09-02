// Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// App
import { SharedGameModule } from '@shared-game/shared-game.module';
import { SharedChatModule } from '@shared-chat/shared-chat.module';
import { AuthGuardService } from '@service/auth-guard.service';
// Platform
import { PlatformComponent } from './platform.component';
import { GameUpdateService } from './game-update.service';

const routes: Routes = [
  {
    path: '',
    component: PlatformComponent,
    canActivate: [AuthGuardService]
  }
];
@NgModule({
  imports: [
    SharedGameModule,
    SharedChatModule,
    RouterModule.forChild(routes),
  ],
  declarations: [PlatformComponent],
  providers: [GameUpdateService],
  exports: [PlatformComponent],
  entryComponents: [
    PlatformComponent
  ],
})
export class PlatformModule {
  static entry = PlatformComponent;
}
