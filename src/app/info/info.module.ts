import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommonUnitModule } from '@common-unit/common-unit.module';
import { SharedCoreModule } from '@shared-core/shared-core.module';
import { SharedGameModule } from '@shared-game/shared-game.module';
import { InfoComponent } from './info.component';
// import { detailPartPipe } from '@app/shared-game/detail-part.pipe';
// import { TranslatePipeModule } from '@app/translate-pipe/translate-pipe.module';

const routes: Routes = [
  { path: '', component: InfoComponent }
];

@NgModule({
  imports: [
    SharedCoreModule,
    CommonUnitModule,
    RouterModule.forChild(routes),
    SharedGameModule
  ],
  declarations: [
    InfoComponent,
    
  ],
  exports: [
    SharedGameModule
  ]
})
export class InfoModule { }
