import { reactive } from '@arrow-js/core';
import { toCalendar } from 'calendar';
import { Square } from 'square';
import { toTag } from 'tag';

const main = () => {
  const id = 'root';
  const colors = ['green', 'maroon'];
  const greetings = ['Green', 'Red'];
  const data = reactive({
    err: 1, date: null 
  });
  const props = { 
    color: ({err}) => colors[err % 2],
    text: ({ date }) => {
      const message = 'Pick a Date';
      if (date === null) return message;
      const d = new Date(Date.parse(date));
      return d.toDateString();
    },
    data, "@click": () => {
      if (data.err === 0) {
        data.date = null;
        data.err = 1;
      }
      else {
        data.date = (new Date()).toISOString();
        data.err = 0;
      }
    }
  };
  // The square greeting reacts to user input
  const square = toTag('square', Square)``(props);
  const el = document.getElementById(id);
  const style = `
    grid-column: 2;
    display: grid; 
    gap: 0.5rem;
  `
  // The calendar
  const Calendar = toCalendar(data);
  const calendar = toTag('calendar', Calendar)``({ 
    data, date: d => d.date
  });
  toTag('div')`
    ${square}${calendar}
  `({ style })(el);
}

export default main
