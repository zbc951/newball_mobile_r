// Angular
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

// App
import { SharedCoreModule } from '@shared-core/shared-core.module';
import { SharedGameModule } from '@shared-game/shared-game.module';
// Service
import { GamesService } from '@app/lobby/games/games.service';
import { GamesStoreService } from '@app/lobby/games/games-store.service';
import { BetService } from './bet.service';
import { BallCreditService } from './ball-credit.service';
import { SpecialPlayService } from '../lobby/special-play.service';
// Component
import { BetComponent } from './bet.component';


@NgModule({
  imports: [

    SharedGameModule,
    ReactiveFormsModule
  ],
  declarations: [
    BetComponent
  ],
  exports: [
    BetComponent
  ],
  entryComponents: [
    BetComponent
  ],
  providers: [
    GamesService,
    GamesStoreService,
    BetService,
    BallCreditService,
    SpecialPlayService
  ]
})
export class BetModule {
  static entry = BetComponent;
}
