import squareCSS from 'square-css' assert { type: 'css' };
import globalCSS from 'global-css' assert { type: 'css' };
import { toTag, CustomTag } from 'tag';

const toSquare = (data) => {

  const colors = [
    [
      '--basic-background', '--main-text-color', '--the-box-shadow',
    ],
    [
      '--dull-background', '--darkest-text-color', '--error-box-shadow'
    ]
  ];

  class Square extends CustomTag {

    static get setup() {
      return {
        text: '', err: 0
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
      const i = data.err % colors.length;
      const [background, color, shadow] = colors[i];
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(`.square {
        background-color: var(${background});
        box-shadow: var(${shadow});
        color: var(${color});
      }`);
      return [globalCSS, squareCSS, sheet];
    }
  }
  return toTag('square', Square)``({
    class: 'centered-content row1-grid',
    text: ({ date }) => {
      const message = 'Pick a Date';
      if (date === null) return message;
      const d = new Date(Date.parse(date));
      return d.toDateString();
    },
    data, "@click": () => {
      if (data.err !== 0) {
        data.date = (new Date()).toISOString();
        data.err = 0;
      }
    }
  });
}

export { toSquare };
