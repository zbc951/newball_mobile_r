interface IHead {
  front: number;
  back: number;
}

/**
 * 切割球頭前後半段
 * @param ptype 玩法
 * @param rb    球頭
 * @param side  下注邊
 * @param str   強弱
 */
export function splitHead(ptype, rb, side, str) {
  const res: any = {};
  let tmp = [];
  if (typeof (rb) !== 'undefined') {
    if (rb.indexOf('+') > 0) {
      tmp = rb.split('+');
      res.front = tmp[0] * 1;
      res.back = tmp[1] * 1;
    } else if (rb.indexOf('-') > 0) {
      tmp = rb.split('-');
      res.front = tmp[0] * 1;
      res.back = tmp[1] * -1;
    } else {
      res.front = 0;
      res.back = 0;
    }
  }
  switch (ptype) {
    case 'R': case 'RE': case '2R':
      if (str !== side) {
        res.front = res.front * -1;
        res.back = res.back * -1;
      }
      break;
    case 'OU': case 'ROU':
      if (side === 'C') {
        res.front = res.front * -1;
        res.back = res.back * -1;
      }
      break;
    default:
      res.front = 0;
      res.back = 0;
  }
  return res as IHead;
}


export function splitResHead(change) {
  const head = change.split('/');
  let front = head[0];
  let back = head[1];
  if (front * 1 < 0) {
    front = front * -1;
    back = back * -1;
  }
  if (back >= 0) {
    back = '+' + back.toString();
  }
  const newHead = String(front) + String(back);
  return newHead;
}
