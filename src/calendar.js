import calendarCSS from 'calendar-css' assert { type: 'css' };
import lionCalCSS from 'lion-cal-css' assert { type: 'css' };
import globalCSS from 'global-css' assert { type: 'css' };
import { toTag, CustomTag } from 'tag';
import { LionCalendar } from "@lion/calendar";

const toLionCal = data => {
  return class LionCal extends LionCalendar {

    constructor() {
      super();
      this.mutate = new MutationObserver(() => {
        if (this.hasDate) {
          data.date = this.date.toISOString();
          data.err = 0;
        }
        else {
          data.date = null;
          data.err = 1;
        }
      });
    }

    connectedCallback() {
      super.connectedCallback();
      const root = this.shadowRoot;
      const sheets = [ globalCSS, lionCalCSS ];
      root.adoptedStyleSheets = sheets;
      this.mutate.observe(root, { 
        subtree: true, childList: true,
        attributes: true
      });
    }

    get date() {
      if (this.hasDate === false) return null;
      return this.shadowRoot.host.__centralDate;
    }

    get hasDate() {
      const root = this.shadowRoot;
      const central = root.host.__centralDate;
      const selected = root.host.__selectedDate;
      if (!central || !selected) return false;
      return selected.getTime() === central.getTime();
    }
  }
}

const toCalendar = data => {
  return class Calendar extends CustomTag {

    constructor() {
      super();
    }

    static get setup() {
      return {
        date: (new Date()).toISOString()
      };
    }

    get root() {
      const LionCal = toLionCal(data);
      const cal = toTag('lion-cal', LionCal)``({
        class: 'content', name: 'cal'
      });
      return toTag('div')`${cal}`({ class: 'root' });
    }

    get styles() {
      return [calendarCSS];
    }

    changed(name, _, value) {
      console.log(name, value);
    }
  }
}

export { toCalendar };
