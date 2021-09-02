// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedCoreModule } from '@shared-core/shared-core.module';

// import { SurplusComponent } from './surplus/surplus.component';
import { GameTableComponent } from './game-table/game-table.component';
import { MixingCheckerComponent } from './mixing-checker/mixing-checker.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { BallCreditService } from '@app/bet/ball-credit.service';
import { BetService } from '@app/bet/bet.service';

import { OddsNamePipe } from './odds-name.pipe';
import { SideNamePipe } from './side-name.pipe';
import { HeadNamePipe } from './head-name.pipe';
import { DetailOddsNamePipe } from './detail-odds-name.pipe';
import { detailPartPipe } from './detail-part.pipe';
import { OddsMPipe ,OddsFieldPipe ,OddsStrongPipe ,OddsHKPipe} from './odds-share.pipe';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedCoreModule,
  ],
  declarations: [
    GameTableComponent,
    // SurplusComponent,
    MixingCheckerComponent,
    OddsNamePipe,
    SideNamePipe,
    HeadNamePipe,
    DetailOddsNamePipe,
    detailPartPipe,
    OddsMPipe,
    OddsFieldPipe,

    OddsStrongPipe,
    OddsHKPipe
  ],
  exports: [
    CommonModule,
    SharedCoreModule,
    FormsModule,
    ReactiveFormsModule,
    GameTableComponent,
    // SurplusComponent,
    MixingCheckerComponent,
    OddsNamePipe,
    SideNamePipe,
    HeadNamePipe,
    DetailOddsNamePipe,
    detailPartPipe,
    OddsMPipe,
    OddsFieldPipe,
    OddsStrongPipe,
    OddsHKPipe
  ],
  providers: [
    BetService,
    BallCreditService
  ]
})
export class SharedGameModule { }
