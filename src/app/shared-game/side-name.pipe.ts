import { Pipe, PipeTransform } from '@angular/core';
import { ConfigSetService } from '@service/config-set.service';
import { TransSide } from 'ts/translate-value';
@Pipe({
  name: 'sideName'
})
export class SideNamePipe implements PipeTransform {

  private nameChart = TransSide[this.configSet.lang];
  constructor(private configSet: ConfigSetService) { }
  transform(side: string, type: string, short: boolean = false): string {
    let sideName;
    if (type === 'OU' || type === 'OU_1' || type === 'OU_2') {
      side = side === 'H' ? 'BIG' : 'SMALL';
    }
    sideName = this.nameChart[side];
    if (short) {
      return sideName.charAt(0);
    }
    return sideName;
  }

}
