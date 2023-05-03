import squareCSS from 'square-css' assert { type: 'css' };
import globalCSS from 'global-css' assert { type: 'css' };
import { toTag, CustomTag } from 'tag';

class Square extends CustomTag {

  static get setup() {
    return {
      text: '', color: 'black',
      background: 'white'
    };
  }

  get root() {
    const square = toTag('div')`${d => d.text}`({
      data: this.data, class: 'square centered'
    });
    return toTag('div')`${square}`({
      class: 'root centered'
    });
  }

  get styles() {
    const { color, background } = this.data;
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`.square {
      background-color: var(${background});
      color: var(${color});
    }`);
    return [globalCSS, squareCSS, sheet];
  }
}

export { Square };
