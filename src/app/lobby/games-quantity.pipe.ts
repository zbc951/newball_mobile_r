import { Pipe, PipeTransform } from '@angular/core';





/**算玩法場次 */
@Pipe({
  name: 'ballListcount'
})
export class ballListcountPipe implements PipeTransform {


  constructor() { }

  transform(val: any,type:string) {
    let count =0;
    if(val){

      if(type == 'all'){
        for (let key in val) {
          if( (key != 'R') && (key != 'RE') ){
            count+=val[key].ALL;
            count+=val[key].RE;
          }
        }
      }else{
        for (let key in val) {
          if( (key != 'R') && (key != 'RE') ){
            count+=val[key][type];
          }
        }
      }


      return count;
    }else{
      return 0;
    }
    
  }

}


/**算全部的賽式場次 */
@Pipe({
  name: 'ballQuantity'
})
export class ballQuantityPipe implements PipeTransform {


  constructor() { }

  transform(val: any,type:string){
   if(type == 'all'){
    return val.content.ALL + val.content.RE;
   }else{
    return val.count;
   }
  }

}