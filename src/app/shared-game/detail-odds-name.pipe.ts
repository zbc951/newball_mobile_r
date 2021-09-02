import { Pipe, PipeTransform } from '@angular/core';
import { ConfigSetService } from '@service/config-set.service';
import { DetailTransOdds } from 'ts/translate-value';
@Pipe({
  name: 'detailOddsName'
})
export class DetailOddsNamePipe implements PipeTransform {

  private nameChart = DetailTransOdds[this.configSet.lang];
  constructor(private configSet: ConfigSetService) { }

  transform(type: string): string {
    return this.nameChart[type];
  }

}

