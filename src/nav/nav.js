import navCSS from 'nav-css' assert { type: 'css' };
import globalCSS from 'global-css' assert { type: 'css' };
import { backPhase, isFirstPhase } from 'phases';
import { nextPhase, isLastPhase } from 'phases';
import { toTag, CustomTag } from 'tag';

const toNav = (data) => {

  const colors = [
    [
      '--basic-background', '--main-text-color', '--the-box-shadow',
    ],
    [
      '--dull-background', '--darkest-text-color', '--error-box-shadow'
    ]
  ];

  class Nav extends CustomTag {

    static get setup() {
      return {
        text: ''
      };
    }

    get root() {
      const back_text = () => {
        const home = isFirstPhase(data.phase);
        if (home) return 'Home';
        return '← Back';
      }
      const next_text = () => {
        const home = isLastPhase(data.phase);
        if (home) return 'Done';
        return 'Next →';
      }
      const back = () => {
        return toTag('div')`${back_text}`({
          '@click': () => {
            data.err = 1;
            data.date = null;
            data.phase = backPhase(data.phase);
          }
        });
      }
      const next = () => {
        return toTag('div')`${next_text}`({
          '@click': () => {
            data.err = 1;
            data.date = null;
            data.phase = nextPhase(data.phase)
          }
        });
      }
      const contents = () => {
        return toTag('div')`${d => d.text}`({
          data: this.data, class: 'contents',
          "@click": () => {
            if (data.err !== 0) {
              data.date = (new Date()).toISOString();
              data.err = 0;
            }
          }
        });
      }
      const nav = toTag('div')`${back}${contents}${next}`({
        data: this.data, class: 'nav centered centered-content'
      });
      return toTag('div')`${nav}`({
        class: 'root centered'
      });
    }

    get styles() {
      const i = data.err % colors.length;
      const [background, color, shadow] = colors[i];
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(`.nav > .contents {
        background-color: var(${background});
        box-shadow: var(${shadow});
        color: var(${color});
      }`);
      return [globalCSS, navCSS, sheet];
    }
  }

  return toTag('nav', Nav)``({
    class: 'centered-content grid-row1',
    text: ({ date }) => {
      return [
        'Event Date',
        'Event Info',
        'Display',
        'Removal',
        'Thanks!'
      ][data.phase];
    },
    phase: data.phase,
    data 
  });
}

export { toNav };
