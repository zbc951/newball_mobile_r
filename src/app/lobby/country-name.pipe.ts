import { Pipe, PipeTransform } from '@angular/core';
import { ConfigSetService } from '@service/config-set.service';
import { CountryName } from 'ts/translate-value';
@Pipe({
  name: 'countryName'
})
export class CountryNamePipe implements PipeTransform {

  private nameChart = CountryName[this.configSet.lang];
  constructor(private configSet: ConfigSetService) { }

  transform(type: string): string {
    return this.nameChart[type];
  }

}


/**
 * 過濾 all 模式下使用資料
 */
// @Pipe({
//   name: 'FilterBall',
//   pure: false
// })
// export class FilterBallPipe implements PipeTransform {


//   constructor() { }

//   transform(val: any,type:string){

//     if(type == 'all'){
//       return val['R'] || [];
//     }else{
//       return val[type] || [];
//     }
    

//   }

// }