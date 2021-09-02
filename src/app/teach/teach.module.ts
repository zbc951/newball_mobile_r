// Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SharedCoreModule } from '@shared-core/shared-core.module';
import { AuthGuardService } from '@service/auth-guard.service';
import { CommonUnitModule } from '@common-unit/common-unit.module';
// Component
import { TeachComponent } from './teach.component';

const routes: Routes = [
  {
    path: '',
    component: TeachComponent,
    canActivate: [AuthGuardService]
  }
];
@NgModule({
  imports: [SharedCoreModule,
    CommonUnitModule,
    RouterModule.forChild(routes),],
  declarations: [TeachComponent],
  providers: [

  ],
})
export class TeachModule {

}
