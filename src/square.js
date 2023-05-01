import squareCSS from 'square-css' assert { type: 'css' };
import { toTag, CustomTag } from 'tag';

class Square extends CustomTag {

  static get setup() {
    return {
      text: '', color: 'blue'
    };
  }

  get root() {
    const square = toTag('div')`${d => d.text}`({
      data: this.data, class: 'square'
    });
    return toTag('div')`${square}`({ class: 'root' });
  }

  get styles() {
    const { color } = this.data;
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`.square {
      background-color: ${color};
    }`);
    return [squareCSS, sheet];
  }
}

export { Square };
