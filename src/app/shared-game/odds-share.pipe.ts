import { Pipe, PipeTransform } from '@angular/core';
import { ConfigSetService } from '@app/service/config-set.service';


/**全場獨營 */
@Pipe({
  name: 'OddsM'
  // pure: false
})
export class OddsMPipe implements PipeTransform {


  constructor() { }

  transform(val:any,type: string) {

    //part
    let odds = '-';
    if(!val){
      return odds;
    }
    let data =[];
    val.forEach(element => {
      // part F=全場.U=上半.D=下半
      if(element.part == 'F'){
        data = element.data;
      }
    });

    if(!data || data.length == 0){
      return odds;
    }

    data.forEach(element => {
      if(element.side == type){
        odds = element.M.odd;
      }
    });
    return odds || '-';
  }

}


/**全場讓球大小 */
@Pipe({
  name: 'OddsField'
})
export class OddsFieldPipe implements PipeTransform {


  constructor() { }
/**
 * 
 * @param val 資料
 * @param type 玩法
 * @param field 對應欄位
 */
  transform(val:any,type: string,field: string) {
    //part
   
    let odds = '-';
    if(!val || !val['handicaps']){
      return odds;
    }

    let data =[];
    val['handicaps'].forEach(element => {
      if(element.type == type){
        data = element;
      }
    });

    if(!data || data.length == 0){
      return odds;
    }


    return data[field] || '-';
  }

}



@Pipe({
  name: 'OddsStrong'
})
export class OddsStrongPipe implements PipeTransform {

  constructor() { }
/**
 * 
 * @param val 資料
 * @param type 玩法
 * @param Strong 強隊
 */
  transform(val:any,type: string,Strong: string){


    let data =[];
    if(!val || !val['handicaps']){
      return '';
    }
    val['handicaps'].forEach(element => {
      if(element.type == type){
        data = element;
      }
    });
    
    return data['head'];
  }
}


/**全場獨營 */
@Pipe({
  name: 'OddsHK',
  // pure: false
})
export class OddsHKPipe implements PipeTransform {


  constructor( private configSet: ConfigSetService,) { }

  transform(val:any,HKodd:Boolean) {
    if (HKodd == undefined) {
      HKodd = this.configSet.openHKodd;
    }
    if(!HKodd && val != '-'){
  
     return (Number(val)+1).toString().match(/^\d+(?:\.\d{0,2})?/);
    }
    return val;
  }

}