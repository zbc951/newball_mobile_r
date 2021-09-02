import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommonUnitModule } from '@common-unit/common-unit.module';
import { SharedCoreModule } from '@shared-core/shared-core.module';
import { SharedGameModule } from '@shared-game/shared-game.module';
import { UserComponent } from './user.component';
// import { detailPartPipe } from '@app/shared-game/detail-part.pipe';
// import { TranslatePipeModule } from '@app/translate-pipe/translate-pipe.module';

const routes: Routes = [
  { path: '', component: UserComponent }
];

@NgModule({
  imports: [
    SharedCoreModule,
    CommonUnitModule,
    RouterModule.forChild(routes),
    SharedGameModule
  ],
  declarations: [
    UserComponent,
    
  ],
  exports: [
    SharedGameModule
  ]
})
export class UserModule { }
