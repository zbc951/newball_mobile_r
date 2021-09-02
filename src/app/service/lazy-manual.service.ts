import { Injectable, SystemJsNgModuleLoader, NgModuleFactory } from '@angular/core';
import { BetStatusService } from '@service/status-bet.service';
import { StatusMenuService } from '@service/status-menu.service';
import { StatusPlatformService } from '@service/status-platform.service';
import { DEVICE } from '@app/app.config';

@Injectable()
export class LazyManualService {

  lazyComponent = {
    bet: undefined,
    menu: undefined,
    platform: undefined
  }
  lazyModule = {
    bet: undefined,
    menu: undefined,
    platform: undefined
  }
  modulesPath = {
    bet: 'app/bet/bet.module#BetModule',
    menu: 'app/menu/menu.module#MenuModule',
    platform: 'app/platform/platform.module#PlatformModule'
  };
  constructor(
    private betStatus: BetStatusService,
    private statusMenu: StatusMenuService,
    private statusPlatform: StatusPlatformService,
    private moduleLoader: SystemJsNgModuleLoader
  ) {
    if (DEVICE.tablet) { this.goModule('menu'); }
  }

  betStatusListener() {
    return this.betStatus.isOpen$.do(isOpen => {
      if (isOpen) {
        this.goModule('bet');
        document.documentElement.style.overflow = 'hidden';
      }
      else {
        this.lazyComponent.bet = undefined;
        document.documentElement.style.overflow = 'hidden';//auto
      }
    })
  }
  platformStatusListener() {
    return this.statusPlatform.isOpen$.do(isOpen => {
      if (isOpen) {
        this.goModule('platform');
        document.documentElement.style.overflow = 'hidden';
      }
      else {
        this.lazyComponent.platform = undefined;
        document.documentElement.style.overflow = 'hidden';//auto
      }
    })
  }

  menuStatusListener() {
    const subscriber = this.statusMenu.isOpen$.subscribe(isOpen => {
      if (isOpen) { this.goModule('menu'); subscriber.unsubscribe(); }
    })
  }

  private goModule(name) {
    const path = this.modulesPath[name];
    const setting = (moduleFactory: NgModuleFactory<any>) => {
      this.lazyComponent[name] = (<any>moduleFactory.moduleType).entry;
      this.lazyModule[name] = moduleFactory;
    };
    this.moduleLoader.load(path).then(setting);
  }

}
