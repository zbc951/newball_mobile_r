// Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// App
import { AuthGuardService } from '@service/auth-guard.service';
import { LoginComponent } from '@common-unit/login/login.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'teach',
    loadChildren: 'app/teach/teach.module#TeachModule',
    canLoad: [AuthGuardService]
  },
  {
    path: 'lobby',
    loadChildren: 'app/lobby/lobby.module#LobbyModule',
    canLoad: [AuthGuardService]
  },
  {
    path: 'report',
    loadChildren: 'app/report/report.module#ReportModule',
    canLoad: [AuthGuardService]
  },
  {
    path: 'live',
    loadChildren: 'app/live/live.module#LiveModule',
    canLoad: [AuthGuardService]
  },
  {
    path: 'more',
    loadChildren: 'app/more/more.module#MoreModule',
    canLoad: [AuthGuardService]
  },
  {
    path: 'info',
    loadChildren: 'app/info/info.module#InfoModule',
    canLoad: [AuthGuardService]
  },
  {
    path: 'user',
    loadChildren: 'app/user/user.module#UserModule',
    canLoad: [AuthGuardService]
  }
];
const manualRoutes: Routes = [
  { path: '', loadChildren: 'app/bet/bet.module#BetModule' },
  { path: '', loadChildren: 'app/menu/menu.module#MenuModule' },
  { path: '', loadChildren: 'app/platform/platform.module#PlatformModule' },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true }),
    RouterModule.forChild(manualRoutes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
