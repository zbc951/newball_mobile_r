// Angular
import { NgModule } from '@angular/core';

// System
import { ApiService } from './api.service';
import { LoginAppService } from './login-app.service';
import { LoginBackService } from './login-back.service';
import { AuthGuardService } from './auth-guard.service';
import { ConfigSetService } from './config-set.service';
// Feature Data
import { MemberService } from './store-member.service';
import { CreditService } from './store-credit.service';
import { NameChartService } from './name-chart.service';
import { ChatService } from '@shared-chat/chat.service';

// Transports
import { StatusPlatformService } from '@service/status-platform.service';
// Status
import { UidStatusService } from './status-uid.service';
import { PlayStatusService } from './status-play.service';
import { BallStatusService } from './status-ball.service';
import { BetStatusService } from './status-bet.service';
import { ProcessingCircleStatusService } from './status-processing-circle.service';
import { DialogStatusService } from './status-dialog.service';
import { StatusMenuService } from './status-menu.service';
import { OrderRemindService } from './status-orders.service';
import { BallQuantityService } from './ball-quantity.service';
import { ScoreService } from './score.service';
import { LazyManualService } from './lazy-manual.service';

@NgModule({

  providers: [
    ApiService,
    MemberService,
    LoginAppService,
    LoginBackService,
    UidStatusService,
    AuthGuardService,
    ConfigSetService,
    CreditService,
    NameChartService,
    BetStatusService,
    StatusPlatformService,
    PlayStatusService,
    BallStatusService,
    OrderRemindService,
    StatusMenuService,
    BallQuantityService,
    LazyManualService,
    ScoreService,
    ChatService,
    ProcessingCircleStatusService,
    DialogStatusService
  ]
})
export class ServiceModule {
}
