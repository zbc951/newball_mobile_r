import { Pipe, PipeTransform } from '@angular/core';
import { ConfigSetService } from '@app/service/config-set.service';
import { DEFAULT } from '@app/app.config';
import { TransBet } from 'ts/translate-value';
// 語系
const DEFAULT_Lang = DEFAULT.LANG;
// import { TransHead } from 'ts/translate-value';
// import { ConfigSetService, Lang } from '@app/service/config-set.service';
// function setFTHead(fr, bk) {
//   if (fr === 0 && bk === 0) { return '平手'; }
//   if (fr === 0 && (bk === 50 || bk === -50)) { return '平手/半球'; }
//   if (fr === 0 && (bk === 100 || bk === -100)) { return '負1輸'; }
//   if (bk === 0) { return fr + '球'; }
//   if (fr === 1 && bk === 100) { return '半球'; }
//   if (bk === 100) { return (fr - 1) + '球半'; }
//   if (fr === 1 && bk === 50) { return '半球/1球'; }
//   if (bk === -50) { return fr + '球/' + fr + '球半'; }
//   if (bk === 50) { return (fr - 1) + '球半/' + fr + '球'; }
//   if (bk < 0) { return fr + '' + bk; }
//   return fr + '+' + bk;
// }
// function setHead(fr, bk) {
//   if (fr === 0 && bk === 0) { return '0'; }
//   if (fr === 0 && (bk === 100 || bk === -100)) { return '負1輸'; }
//   if (bk === 0) { return fr + '平'; }
//   if (bk === 100) { return (fr - 1) + '.5'; }
//   if (bk < 0) { return fr + '' + bk; }
//   return fr + '+' + bk;
// }
// function setFTHead(fr, bk, lang) {
//   if (fr === 0 && bk === 0) { return TransHead[lang]['Draw']; }
//   if (fr === 0 && (bk === 50 || bk === -50)) { return `${TransHead[lang]['Draw']}/${TransHead[lang]['HalfBall']}`; }
//   // if (fr === 0 && (bk === 100 || bk === -100)) { return TransHead[lang]['Nav1Lose']; }
//   if (bk === 0) { return fr + TransHead[lang]['Ball']; }
//   if (fr === 1 && bk === 100) { return TransHead[lang]['HalfBall']; }
//   if (bk === 100) { return (fr - 1) + TransHead[lang]['Dot5']; }
//   if (fr === 1 && bk === 50) { return `${TransHead[lang]['HalfBall']}/1${TransHead[lang]['Ball']}`; }
//   if (bk === -50) { return fr + `${TransHead[lang]['Ball']}/` + fr + TransHead[lang]['Dot5']; }
//   if (bk === 50) { return (fr - 1) + `${TransHead[lang]['Dot5']}/` + fr + TransHead[lang]['Ball']; }
//   if (bk < 0) { return fr + '' + bk; }
//   return fr + '+' + bk;
// }
// function setHead(fr, bk, lang) {
//   if (fr === 0 && bk === 0) { return '0'; }
//   // if (fr === 0 && (bk === 100 || bk === -100)) { return TransHead[lang]['Nav1Lose']; }
//   if (bk === 0) { return fr + TransHead[lang]['Draw']; }
//   if (bk === 100) { return (fr - 1) + '.5'; }
//   if (bk < 0) { return fr + '' + bk; }
//   return fr + '+' + bk;
// }
function setFTHead(fr, bk) {
  if (fr == 0 && bk == -50)
    return '0/0.5';
  if (fr == 0 && bk == 50)
    return '0/0.5';
  if (bk == 100)
    return (fr - 1) + ".5";
  if (bk == 0)
    return fr;
  if (bk == 50)
    return (fr - 1) + ".5/" + fr;
  if (bk == -50)
    return fr + "/" + fr + ".5";
  if (bk > 0)
    return fr + "+" + bk;

  return fr + bk;
}
//修改掉+號
function setHead(fr, bk, st) {
  if (fr == 0 && bk == 0)
    return '0';
  if (bk == 0)
    return (st? '' : '-') + fr + TransBet[DEFAULT.LANG]['Same'];  //前+
  if (bk == 100)
    return (st? '' : '-') + (fr - 1) + '.5';//前+
  if (bk < 0)
    if (!st) {
      return (fr == 0 ? '' : '-') + fr + '+' + (bk * -1);
    } else {
      return (fr == 0 ? '' : '') + fr + '' + bk;//後+
    }
  if (!st) {
    return (fr == 0 ? '' : '-') + fr + '-' + bk;
  } else {
    return (fr == 0 ? '' : '') + fr + '+' + bk;//後+
  }
}
// function setHead(fr, bk, st) {
//   if (fr == 0 && bk == 0)
//     return '0';
//   if (bk == 0)
//     return fr + TransBet[DEFAULT.LANG]['Same'];
//   if (bk == 100)
//     return (fr - 1) + '.5';
//   if (bk < 0)
//     return fr + '' + bk;
//   return fr + '+' + bk;
// }
function chgcon(con, ratio) {
  let backstr;
  let tcon = parseInt(con);
  let tratio = parseInt(ratio);
  if (tcon == 0) {
    switch (tratio) {
      case 0:
        backstr = "0";
        break;
      case -50:
        backstr = "0/0.5";
        break;
      case -100:
        backstr = "0.5";
        break;
      default:
        backstr = "";
        break;
    }
  } else {
    switch (tratio) {
      case 0:
        backstr = tcon;
        break;
      case 50:
        backstr = tcon;
        tcon = tcon - 1;
        backstr = tcon + ".5/" + backstr;
        break;
      case 100:
        tcon = tcon - 1;
        backstr = tcon + ".5";
        break;
      case -50:
        backstr = tcon + "/" + tcon + ".5";
        break;
      case -100:
        backstr = tcon + ".5";
        break;
      default:
        backstr = "";
        break;
    }
  }
  return backstr;
}
// export function transformFn(value: string, gtype: string, lang: Lang) {
export function transformFn(value: string, gtype: string, strong: boolean) {
  if (value === undefined) { return '' };
  let fr;
  let bk;

  if (value.indexOf('+') > 0) {
    const t: any[] = value.split('+');
    fr = t[0] * 1;
    bk = t[1] * 1;
  } else if (value.indexOf('-') > 0) {
    const t: any[] = value.split('-');
    fr = t[0] * 1;
    bk = t[1] * -1;
  } else {
    return value;
  }

  switch (gtype) {
    case 'FT':
      if (DEFAULT_Lang == 'zh-cn') {
        return (strong ? '+' : '-') + chgcon(fr, bk);
      }
      return setHead(fr, bk, strong);
    default: return setHead(fr, bk, strong);
  }
  // return setHead(fr, bk);
}


@Pipe({
  name: 'headName'
})
export class HeadNamePipe implements PipeTransform {
  // constructor(private configSet: ConfigSetService) { }
  transform(value: string, gtype: string, strong: boolean = true, play = ''): any {
    if (/H\dC\d/.test(value)) return value.replace('H', '').replace('C', ':');
    if (!strong) return '';//修改雙邊顯示球投

    if (play.indexOf('OU') >= 0) { // 大小只顯示正的
      strong = true;
    }
    // return transformFn(value, gtype, this.configSet.lang);
    return transformFn(value, gtype, strong);
  }


}
