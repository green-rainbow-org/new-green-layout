import globalCSS from 'global-css' assert { type: 'css' };
import { reactive } from '@arrow-js/core';
import { toCalendar } from 'calendar';
import { Backdrop } from 'backdrop';
import { Square } from 'square';
import { toTag } from 'tag';

const handleResize = (d) => {
  return () => {
    d.height = window.innerHeight;
    d.width = window.innerWidth;
  }
}

const main = () => {
  const colors = [
    [
      '--basic-background', '--main-text-color',
    ],
    [
      '--dull-background', '--error-text-color'
    ]
  ];
  const data = reactive({
    err: 1, date: null,
    height: window.innerHeight,
    width: window.innerWidth
  });
  const resize = handleResize(data);
  window.addEventListener('resize', resize);
  const props = { 
    class: 'centered-content row1-grid',
    background: ({err}) => colors[err % 2][0],
    color: ({err}) => colors[err % 2][1],
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
  // The calendar
  const Calendar = toCalendar(data);
  const backdrop = toTag('backdrop', Backdrop)``({
    data,
    width: d => d.width,
    height: d => d.height,
    class: 'full-grid content'
  });
  const calendar = toTag('calendar', Calendar)``({ 
    class: `
      centered centered-content row2-grid calendar index
    `,
    data, date: d => d.date
  });
  const root_class = 'centered root index';
  document.adoptedStyleSheets = [ globalCSS ];
  toTag('div')`
    ${backdrop}${square}${calendar}
  `({ class: root_class })(document.body);
}

export default main
