import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'PipeGtype'
})
export class PipeGtype implements PipeTransform {

  transform(value: any, args?: any): any {

    let gtypes:Array<string> = [];
    value.forEach(element => {
      if(gtypes.indexOf(element.gtypes) == -1){
        gtypes.push(element.gtypes);
      }
    });


    return gtypes;
  }

}

@Pipe({
  name: 'PipeLeague',
  pure: false
})
export class PipeLeague implements PipeTransform {

  transform(value: any, _gtype?: any): any {
    let val:any = [];
    value.forEach(element => {
      if(element.gtypes == _gtype.gtypes){
        if(val.indexOf(element.league)  == -1){
          val.push(element.league);
        }
      }
    });

    return val;
  }

}
