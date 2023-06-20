import eventFormCSS from 'form-css' assert { type: 'css' };
import { toTag, CustomTag } from 'tag';
import { phases, phaseMap, isPhase } from 'phases';
import { toCalendar } from 'calendar';
import { toEditor } from 'editor';

const infos = {
  'welcome': () => `
    Welcome to the content creator for the Green Rainbow Party. 
    To post an event, a survey, or an announcement, please pick
    the kind of content you'd like to post.
  `,
  'event': what => `When will ${what} happen?`,
  'text': what => {
    const more = what.match(/event/i) ? ' description' : '';
    return `Please write up ${what}${more}.`;
  },
  'start': what => {
    const event_ask = `Before ${what} starts, please`;
    const ask = what.match(/event/i) ? event_ask : 'Please';
    return `${ask} decide when to post ${what} to the homepage.`;
  },
  'end': what => {
    const ask = `After we post ${what},`;
    return `${ask} how long should it stay on the homepage?`;
  },
  'review': what => `Are you ready to share ${what}?`
};
const prefix = {
  'event': 'The event is on',
  'start': 'Going on homepage on',
  'end': 'Removing from homepage on'
}

const parseDate = (date_string) => {
  if (date_string === null) return null;
  return new Date(Date.parse(date_string));
}

const formatDate = (date) => {
  if (date === null) return '';
  const opts = { dateStyle: "full" };
  return date.toLocaleDateString('en-US', opts);
}

const toInfo = (what, phase, dates, date) => {
  const info_text = infos[phases[phase]](what);
  const all_d = ['start', 'event', 'end'].map(label => {
    const date = dates[phaseMap[label] || 0];
    if (date === null) return null;
    return {label, d: parseDate(date)};
  }).filter(x => x).sort((a, b) => a.d-b.d).map(v => {
    const d = formatDate(v.d);
    const pre = prefix[v.label];
    return toTag('div')`${pre} <strong>${d}</strong>`();
  });
  if (isPhase(phase, 'review')) {
    const list = toTag('div')`${all_d}`();
    return toTag('div')`${info_text} ${list}`();
  }
  const label = phases[phase];
  const no_dates = new Set(['text', 'welcome']);
  if (!date || no_dates.has(label)) {
    return toTag('div')`${info_text}`();
  }
  const d = formatDate(parseDate(date));
  return toTag('div')`${info_text} <strong>${d}</strong>`();
}

const daysToMS = (days) => {
  return days * 24 * 60 * 60 * 1000;
}

const toChoices = (what, phase, dates, setDate) => {
  if (!isPhase(phase, 'end')) return toTag('div')``();
  const is_event = !!what.match(/event/i);
  const choices = [
    [`Two weeks after ${what}`, daysToMS(14)],
    [`Four weeks after ${what}`, daysToMS(28)],
    [`Two months after ${what}`, daysToMS(60)],
    [`Four months after ${what}`, daysToMS(120)],
  ]
  const items = choices.map(c => {
    return toTag('div')`${c[0]}`({
      '@click': () => {
        const basis = ['start', 'event'][+is_event];
        const date = dates[phaseMap[basis] || 0];
        if (date === null) return;
        const epoch = parseDate(date).getTime();
        const next_date = new Date(epoch + c[1]);
        setDate(next_date.toISOString());
      }
    })
  });
  const list = toTag('div')`${items}`();
  return toTag('div')`${list}`({ class: 'options' });
}

const toEventForm = (data, globalCSS) => {

  class EventForm extends CustomTag {

    static get setup() {
      return { };
    }

    get date() {
      return data.getActiveDate(null);
    }

    set date(date) {
      data.setActiveDate(date);
    }

    get root() {
      const info = () => {
        return toTag('div')`${() => {
          const what = [
          'your news announcement', 'your event'
          ][+data.is_event];
          return toInfo(what, data.phase, data.dates, this.date);
        }}`();
      }
      const choices = () => {
        return toTag('div')`${() => {
          const setDate = (date) => this.date = date;
          const what = ['posting', 'the event'][+data.is_event];
          return toChoices(what, data.phase, data.dates, setDate);
        }}`();
      }
      // Text Editor
      const editor = () => {
        return toEditor(data, globalCSS);
      }
      // Interactive Calendar
      const calendar = () => {
        return toCalendar(data, globalCSS);
      }
      return toTag('form')`${info}${choices}${editor}${calendar}`({
        class: 'event-form centered'
      });
    }

    get styles() {
      return [globalCSS, eventFormCSS];
    }
  }

  return toTag('event-form', EventForm)``({
    class: 'grid-row2'
  });
}

export { toEventForm };
