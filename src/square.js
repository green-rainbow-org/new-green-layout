import squareCSS from 'square-css' assert { type: 'css' };
import globalCSS from 'global-css' assert { type: 'css' };
import { toTag, CustomTag } from 'tag';

class Square extends CustomTag {

  static get setup() {
    return {
      text: '', shadow: '',
      background: 'white',
      color: 'black'
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
    const { color, shadow, background } = this.data;
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`.square {
      background-color: var(${background});
      box-shadow: var(${shadow});
      color: var(${color});
    }`);
    return [globalCSS, squareCSS, sheet];
  }
}

export { Square };
