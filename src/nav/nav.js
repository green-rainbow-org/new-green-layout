import navCSS from 'nav-css' assert { type: 'css' };
import globalCSS from 'global-css' assert { type: 'css' };
import { backPhase, isFirstPhase } from 'phases';
import { nextPhase, isLastPhase } from 'phases';
import { phaseMap } from 'phases';
import { toTag, CustomTag } from 'tag';

const toNav = (data) => {

  const colors = [
    [
      '--chosen-background', '--dark-text-color',
      '--chosen-box-shadow', '--main-text-shadow',
      'pointer'
    ],
    [
      '--error-background', '--error-text-color',
      '--error-box-shadow', '--error-text-shadow',
      'default'
    ]
  ];

  class Nav extends CustomTag {

    static get setup() {
      return {
        text: '', err: data.err
      };
    }

    get date() {
      return data.getPhaseDate(null);
    }

    set date(date) {
      data.setPhaseDate(data.phase, date);
    }

    get root() {
      const back = () => {
        const not_event = 'just News';
        const first = () => isFirstPhase(data.phase);
        const text = `${['← Back', not_event][+first()]}`;
        return toTag('div')`${text}`({
          data: data,
          '@click': () => {
            if (first()) {
              const event_phase = phaseMap.get('event');
              data.phase = phaseMap.get('start');
              data.setPhaseDate(event_phase, null);
              data.is_event = false;
            }
            // Three atempts at skipping phases
            data.phase = [...'...'].reduce(n => {
              if (!data.skipInvalidPhase(n)) return n;
              return backPhase(n);
            }, backPhase(data.phase));
            // Update date error message
            this.date = data.getPhaseDate(null);
          }
        });
      }
      const next = () => {
        const first = () => isFirstPhase(data.phase);
        const last = () => isLastPhase(data.phase);
        const act1 = ['Next →', 'an Event'][+first()];
        const action = [act1, 'Submit'][+last()];
        return toTag('div')`${action}`({
          class: 'status',
          '@click': () => {
            if (data.err) return; 
            if (first()) data.is_event = true;
            // Three atempts at skipping phases
            data.phase = [...'...'].reduce(n => {
              if (!data.skipInvalidPhase(n)) return n;
              return nextPhase(n);
            }, nextPhase(data.phase));
            // Update date error message
            this.date = data.getPhaseDate(null);
          }
        });
      }
      const header = () => {
        return toTag('div')`${d => d.text}`({
          class: 'centered-content',
          data: this.data,
          "@click": () => {
            if (this.date === null) {
              this.date = (new Date()).toISOString();
              data.err = 0;
            }
          }
        });
      }
      const nav = toTag('div')`${header}`({
        class: 'nav centered grid-row1'
      });
      const buttons = toTag('div')`${back}${next}`({
        class: 'nav centered grid-row3'
      });
      return toTag('div')`${nav}${buttons}`({
        class: 'content'
      });
    }

    get styles() {
      const i = data.err % colors.length;
      const [
        background, color, shadow, text_shadow, cursor
      ] = colors[i];
      const sheet = new CSSStyleSheet();
      const last = isLastPhase(data.phase);
      sheet.replaceSync(`
      .nav > div.status {
        background-color: var(${background});
        text-shadow: var(${text_shadow});
        box-shadow: var(${shadow});
        color: var(${color});
        cursor: ${cursor};
      }`);
      return [globalCSS, navCSS, sheet];
    }
  }

  return toTag('nav', Nav)``({
    class: 'content',
    err: () => data.err,
    text: () => {
      return [
        'Welcome',
        'Event Date',
        'Content',
        'Display',
        'Removal',
        'Review!'
      ][data.phase];
    },
    data 
  });
}

export { toNav };
