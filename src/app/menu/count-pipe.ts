import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'CountFilter'
})
export class CountPipe implements PipeTransform {
  transform(count: number): string {
    return (count === 0) ? '' : `${count}`;
  }

}
