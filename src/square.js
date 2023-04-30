import squareCSS from 'square-css' assert { type: 'css' };
import { toTag, CustomTag } from 'tag';

class Square extends CustomTag {

  static get setup() {
    return {
      text: '', l: '100', c: 'blue'
    };
  }

  get root() {
    const square = toTag('div')`${d => d.text}`({
      data: this.data, class: 'square'
    });
    return toTag('div')`${square}`({ class: 'root' });
  }

  get styles() {
    const { l, c } = this.data;
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`.square {
      width: ${l}px;
      height: ${l}px;
      background-color: ${c};
    }`);
    return [squareCSS, sheet];
  }
}

export { Square };
