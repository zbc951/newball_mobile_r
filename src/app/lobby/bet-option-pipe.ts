import { Pipe, PipeTransform } from '@angular/core';
import { ConfigSetService } from '@service/config-set.service';
import { TransSide } from 'ts/translate-value';
@Pipe({
  name: 'betOption'
})
export class betOptionPipe implements PipeTransform {

  private nameChart = TransSide[this.configSet.lang];
  constructor(private configSet: ConfigSetService) { }

  transform(type: string, play, teamInfo): string {
    var defultType = ['H', 'C', 'N'];
    var BigSmall = ['OU', 'OU_1', 'OU2'];
    var bsMap = {'H':'BIG','C':'SMALL', 'N': 'N'}
    if (defultType.indexOf(type) >= 0 && type !== 'N') {
      if (BigSmall.indexOf(play.type) >= 0) {
        return this.nameChart[bsMap[type]];
      }
      return teamInfo['name_' + type];
    } else {
      return this.nameChart[type];
    }
  }

}
