import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatNumber'
})
export class FormatNumberPipe implements PipeTransform {

  /**
   * 數字轉換: 四捨五入小數兩位、三位一撇
   * @param value  待被轉換的值
   */
  transform(value: any): string | number {
    // 若為 0 或不存在，不做執行
    if (!value) { return 0; }
    // 若為小數，執行 四捨五入小數兩位、三位一撇
    if (value.toString().indexOf('.') > -1) {
      return Number(value).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    } else {
      // 非則只執行三位一撇
      return value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    }
  }

}
