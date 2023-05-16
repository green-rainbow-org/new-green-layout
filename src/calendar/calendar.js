import calendarCSS from 'calendar-css' assert { type: 'css' };
import globalCSS from 'global-css' assert { type: 'css' };
import { LionCalendar } from "@lion/calendar";
import { toTag, CustomTag } from 'tag';

const toCalendar = data => {
  class Calendar extends LionCalendar {

    constructor() {
      super();
      this.mutate = new MutationObserver((records) => {
        if (initialize_calendar(records)) return;
        data.date = this.date?.toISOString() || null;
        data.err = +!this.hasDate;
      });
    }

    connectedCallback() {
      super.connectedCallback();
      const root = this.shadowRoot;
      root.adoptedStyleSheets = [
        globalCSS, calendarCSS
      ];
      this.mutate.observe(root, { 
        subtree: true, childList: true, attributes: true
      });
    }

    get date() {
      if (this.hasDate === false) return null;
      return this.__centralDate;
    }

    get hasDate() {
      const central = this.__centralDate;
      const selected = this.__selectedDate;
      if (!central || !selected) return false;
      return selected.getTime() === central.getTime();
    }
  }
  return toTag('calendar', Calendar)``({ 
    class: `
      centered centered-content row2-grid calendar index
    `,
    data, date: d => d.date
  });
}

const classify_grid = cal => {
  const target = 'calendar__navigation';
  const with_children = el => [el[0], ...el[0].children];
  const els = with_children(cal.getElementsByClassName(target));
  els.forEach(el => el.classList.add('centered'));
}

const initialize_calendar = records => {
  const cal = records.reduce((a, r) => {
    return [...a, ...r.addedNodes];
  }, []).find(a => a.className === 'calendar');
  if (cal !== undefined) classify_grid(cal);
  return cal !== undefined;
}

export { toCalendar };
