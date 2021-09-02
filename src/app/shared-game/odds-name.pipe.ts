import { Pipe, PipeTransform } from '@angular/core';
import { ConfigSetService } from '@service/config-set.service';
import { TransOdds } from 'ts/translate-value';
@Pipe({
  name: 'oddsName'
})
export class OddsNamePipe implements PipeTransform {

  private nameChart = TransOdds[this.configSet.lang];
  constructor(private configSet: ConfigSetService) { }

  transform(type: string): string {
    return this.nameChart[type];
  }

}
