// Angualr
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// Shared
import { SharedCoreModule } from '@shared-core/shared-core.module';
import { CommonUnitModule } from '@common-unit/common-unit.module';


// Component
import { MoreComponent } from './more.component';
import { BillboardComponent } from './billboard/billboard.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { CreditComponent } from './credit/credit.component';
import { SettingComponent } from './setting/setting.component';
import { RuleComponent } from './rule/rule.component';
import { SafeHtmlPipe } from './safe-html.pipe';


const routes: Routes = [
  {
    path: '',
    component: MoreComponent,
    children: [
      { path: 'billboard', component: BillboardComponent },
      { path: 'feedback', component: FeedbackComponent },
      { path: 'credit', component: CreditComponent },
      { path: 'setting', component: SettingComponent },
      { path: 'rule', component: RuleComponent },
    ]
  },
];

@NgModule({
  imports: [
    SharedCoreModule,
    CommonUnitModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    MoreComponent,
    BillboardComponent,
    FeedbackComponent,
    CreditComponent,
    SettingComponent,
    RuleComponent,
    SafeHtmlPipe
  ],
  exports:[
    SafeHtmlPipe
  ]
})
export class MoreModule { }
