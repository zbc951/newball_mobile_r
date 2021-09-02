import { NgModule } from '@angular/core';

import { SharedCoreModule } from '@shared-core/shared-core.module';

import { SurplusComponent } from './surplus/surplus.component';

import { LoginComponent } from './login/login.component';
import { FooterComponent } from './footer/footer.component';
import { ProcessingCircleComponent } from './processing-circle/processing-circle.component';
import { DialogComponent } from './dialog/dialog.component';



@NgModule({
  imports: [
    SharedCoreModule
  ],
  declarations: [
    LoginComponent,
    FooterComponent,
    SurplusComponent,
    ProcessingCircleComponent,
    DialogComponent
  ],
  exports: [
    LoginComponent,
    FooterComponent,
    SurplusComponent,
    ProcessingCircleComponent,
    DialogComponent
  ],
})
export class CommonUnitModule { }
