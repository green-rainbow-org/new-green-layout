import backdropCSS from 'backdrop-css' assert { type: 'css' };
import globalCSS from 'global-css' assert { type: 'css' };
import { reactive } from '@arrow-js/core';
import { toCalendar } from 'calendar';
import { toBackdrop } from 'backdrop';
import { toSquare } from 'square';
import { toTag } from 'tag';

const main = () => {
  const data = reactive({
    err: 1, date: null,
    width: window.innerWidth,
    height: window.innerHeight
  });
  window.addEventListener('resize', handleResize(data));
  document.adoptedStyleSheets = [
    globalCSS, backdropCSS
  ];
  // Date at the top
  const square = toSquare(data);
  // Interactive Calendar
  const calendar = toCalendar(data);
  // Animated Background
  const backdrop = toBackdrop(data);
  // Containers
  const root = toTag('div')`
    ${square}${calendar}
  `({
    class: 'centered root index'
  });
  return toTag('div')`${backdrop}${root}`({
    class: 'centered root wrapper'
  })(document.body);
}

const handleResize = (d) => {
  return () => {
    d.height = window.innerHeight;
    d.width = window.innerWidth;
  }
}

export default main
