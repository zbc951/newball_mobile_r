import { Pipe, PipeTransform } from '@angular/core';
import { ConfigSetService } from '@service/config-set.service';
import { TransDetailPart } from 'ts/translate-value';
@Pipe({
  name: 'detailPart'
})
export class detailPartPipe implements PipeTransform {

  private nameChart = TransDetailPart[this.configSet.lang];
  constructor(private configSet: ConfigSetService) { }

  transform(type: string): string {
    return this.nameChart[type];
  }

}


