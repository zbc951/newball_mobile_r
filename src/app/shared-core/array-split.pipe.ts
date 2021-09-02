import { Pipe, PipeTransform } from '@angular/core';
import { isArray } from 'util';

@Pipe({
  name: 'ArraySplit'
})
export class ArraySplitPipe implements PipeTransform {

  /**
   * 分割array成二維陣列
   * @param value  待被轉換的陣列
   * @param num    要分的陣列長度
   * EX:  
   *    input:  value=[1,2,3,4,5,6,7,8,9,0]  num=4
   *    output: [
   *                [1,2,3,4],
   *                [5,6,7,8],
   *                [9,0]
   *            ]
   */
  transform(value: Array<any>, num: number) {
    if (!isArray(value) || !num || num <= 0) {
        return value;
    }
    let ret = [];
    let sub = [];
    let count = 0;
    value.forEach(item => {
        sub.push(item);
        count++;
        if (count == num) {
            ret.push(sub);
            count = 0;
            sub = [];
        }
    });
    if (sub.length > 0) {
        ret.push(sub);
    }
    return ret;
  }

}
