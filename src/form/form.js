import eventFormCSS from 'form-css' assert { type: 'css' };
import globalCSS from 'global-css' assert { type: 'css' };
import '@tinymce/tinymce-webcomponent';
import { toTag, CustomTag } from 'tag';
import { toCalendar } from 'calendar';
import { toEditor } from 'editor';
import { isPhase } from 'phases';

const infos = [
  'When will the event happen?',
  'What should we say about this?',
  'Display this on the homepage when?',
  'Remove this from the homepage when?',
  'Thanks, we\'ll share your event!'
];

const toInfo = (phase, date) => {
  const info = infos[phase % infos.length];
  if (isPhase(phase, 'text') || date === null) {
    return info;
  }
  const d = new Date(Date.parse(date)).toDateString();
  return [info, d].join(' ');
}

const toEventForm = (data) => {

  class EventForm extends CustomTag {

    static get setup() {
      return { };
    }

    get root() {
      // Info

      const info = () => {
        return toTag('h1')`${() => {
          return toInfo(data.phase, data.date);
        }}`();
      }
      // Text Editor
      const editor = () => {
        if (isPhase(data.phase, 'review')) return '';
        if (!isPhase(data.phase, 'text')) return '';
        return toEditor(data);
      }
      // Interactive Calendar
      const calendar = () => {
        if (isPhase(data.phase, 'review')) return '';
        if (isPhase(data.phase, 'text')) return '';
        return toCalendar(data);
      }
      return toTag('form')`${info}${editor}${calendar}`({
        class: 'event-form centered'
      });
    }

    get styles() {
      return [globalCSS, eventFormCSS];
    }
  }

  return toTag('event-form', EventForm)``({
    class: 'centered-content grid-row2'
  });
}

export { toEventForm };
