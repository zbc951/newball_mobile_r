// Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// App
import { SharedGameModule } from '@shared-game/shared-game.module';
import { AuthGuardService } from '@service/auth-guard.service';
// Service
import { GamesService } from './games/games.service';
import { GamesStoreService } from './games/games-store.service';
import { BallOptionService } from './ball-option.service';
import { StatusSearchService } from '@lobby/status-search.service';
import { SpecialPlayService } from './special-play.service';
// Component
import { LobbyComponent } from '@lobby/lobby.component';
// import { PlayOptionComponent } from './play-option/play-option.component';
// import { BallOptionComponent } from './ball-option/ball-option.component';
// import { GamesComponent } from './games/games.component';
// import { SearchComponent } from './search/search.component';
import { GamesFilterPipe ,gamesSortPipe} from './games-filter.pipe';
import { CommonUnitModule } from '@common-unit/common-unit.module';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { SWIPER_CONFIG } from 'ngx-swiper-wrapper';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { OrdersComponent } from './orders/orders.component';
import { GameDetailComponent } from './game-detail/game-detail.component';
import { betOptionPipe } from './bet-option-pipe';
import { CountryNamePipe , } from './country-name.pipe';
import { ballListcountPipe , ballQuantityPipe } from './games-quantity.pipe';
import { SwitchComponent } from './switch/switch.component';
import { KeyvaluePipe } from './keyvalue.pipe';
import { from } from 'rxjs/observable/from';

import { LiveService } from '@live/live.service';
import { LiveStoreService } from '@live/live-store.service';
const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto'
};

const routes: Routes = [
  {
    path: '',
    component: LobbyComponent,
    canActivate: [AuthGuardService]
  }
];
@NgModule({
  imports: [
    SharedGameModule,
    CommonUnitModule,
    RouterModule.forChild(routes),
    SwiperModule
  ],
  declarations: [
     LobbyComponent,
    // PlayOptionComponent,
    // BallOptionComponent,
    // GamesComponent,
    // SearchComponent,
    GamesFilterPipe,
    gamesSortPipe,
    // InputSearchPipe,
    CountryNamePipe,
    ballListcountPipe,
    ballQuantityPipe,  
    OrdersComponent,
    GameDetailComponent,
    betOptionPipe,
    SwitchComponent,
    KeyvaluePipe
  ],
  providers: [
    GamesService,
    GamesStoreService,
    BallOptionService,
    StatusSearchService,
    SpecialPlayService,
    LiveService,
    LiveStoreService,
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG
    },
    OrdersComponent,
    GameDetailComponent
  ],
})
export class LobbyModule { }
