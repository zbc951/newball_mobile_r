/**
 * Loader物件
 * by clare
 */
class Loader {
  private static readonly defText = '';
  private static readonly loadHtml: string = [`
    <div class="star-loader-block">
      <div class="star-loading"></div>
      <div class="text"></div>
    </div>
  `].join('');

  private element: HTMLElement;
  private textElement: Element;
  private openCount = 0;

  constructor() {
    this.element = this.create();
    this.textElement = this.element.querySelector('.text');
  }

  /**
   * 回傳物件
   */
  public getElement = () => {
    return this.element;
  }

  /**
   * 開啟繞圈圈動畫
   * @param {string} msg 顯示訊息
   * @param {any} zIndex css z-index
   */
  public open = (msg?: string, zIndex?: any) => {
    if (zIndex) {
      this.element.style.zIndex = zIndex;
    } else {
      this.element.style.zIndex = '100';
    }
    if (msg) {
      this.textElement.innerHTML = msg;
    } else {
      this.textElement.innerHTML = Loader.defText;
    }
    this.element.classList.add('show');
    this.element.parentElement.classList.add('star-loader-hidden');
    this.openCount++;
  }

  /**
   * 關閉繞圈圈
   */
  public close = () => {
    if (--this.openCount > 0) { return; }
    this.openCount = 0;
    this.element.style.zIndex = '';
    this.element.classList.remove('show');
    this.element.parentElement.classList.remove('star-loader-hidden');
  }

  /**
   * 絕對關閉繞圈圈
   */
  public closeAll = () => {
    this.openCount = 0;
    this.element.style.zIndex = '';
    this.element.classList.remove('show');
    this.element.parentElement.classList.remove('star-loader-hidden');
  }

  /**
   * 產生繞圈圈物件
   */
  private create = () => {
    let element = document.createElement('div');
    element.className = 'star-loader';
    element.innerHTML = Loader.loadHtml;
    return element;
  }
}

export const loader = new Loader();
export const appendLoader = () => {
  document.querySelector('body').appendChild(loader.getElement());
}
