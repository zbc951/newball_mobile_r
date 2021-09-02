// Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// App
import { SharedGameModule } from '@shared-game/shared-game.module';
// Report
import { ReportComponent } from './report.component';
// import { OrdersComponent } from '../report/orders/orders.component';
// import { HistoryComponent } from './history/history.component';
import { HistoryService } from './history.service';
// import { UnitCalendarComponent } from './history/unit-calendar/unit-calendar.component';
// import { HistoryDetailComponent } from './history/history-detail/history-detail.component';
// import { UnitTabComponent } from './unit-tab/unit-tab.component';
import { OrdersCountService } from './orders-count.service';
import { CommonUnitModule } from '@common-unit/common-unit.module';
// import { UnitSumComponent } from './unit-sum/unit-sum.component';
// import { UnitTableComponent } from './unit-table/unit-table.component';
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'orders'
  },
  {
    path: '',
    component: ReportComponent
    // children: [
    //   {
    //     path: 'orders',
    //     component: OrdersComponent
    //   },
    //   {
    //     path: 'history',
    //     component: HistoryComponent,
    //     children: [
    //       {
    //         path: ':date',
    //         component: HistoryDetailComponent
    //       }
    //     ]
    //   },
    // ]
  },
];
@NgModule({
  imports: [
    SharedGameModule,
    CommonUnitModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    ReportComponent,
    // OrdersComponent,
    // HistoryComponent,
    // HistoryDetailComponent,
    // UnitCalendarComponent,
    // UnitTabComponent,
    // UnitSumComponent,
    // UnitTableComponent
  ],
  providers: [
    HistoryService,
    OrdersCountService
  ]
})
export class ReportModule { }
