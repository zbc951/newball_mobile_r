// Angular
import { NgModule } from '@angular/core';

import { SharedCoreModule } from '@shared-core/shared-core.module';
// Component
import { MenuComponent } from './menu.component';
import { CountPipe } from './count-pipe'; 

@NgModule({
  imports: [SharedCoreModule],
  declarations: [MenuComponent, CountPipe],
  exports: [MenuComponent, CountPipe],
  entryComponents: [MenuComponent]
})
export class MenuModule {
  static entry = MenuComponent;
}
