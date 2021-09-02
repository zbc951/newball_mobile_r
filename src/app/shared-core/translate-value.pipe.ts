import { Pipe, PipeTransform } from '@angular/core';
import { ConfigSetService } from '@app/service/config-set.service';

import { TRANSLATE_PIPE } from 'ts/translate-value';

@Pipe({
  name: 'translateValue'
})
export class TranslateValuePipe implements PipeTransform {
  constructor(private configSet: ConfigSetService) { }
  transform(value: string, type: string): string {
    const lang = this.configSet.lang;
    const basis = TRANSLATE_PIPE[type][lang];
    return basis[value] || value;
  }

}
