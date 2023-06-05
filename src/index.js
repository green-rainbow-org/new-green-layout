import backdropCSS from 'backdrop-css' assert { type: 'css' };
import globalCSS from 'global-css' assert { type: 'css' };
import { phaseMap, isPhase, nPhases } from 'phases';
import { reactive } from '@arrow-js/core';
import { toBackdrop } from 'backdrop';
import { toEventForm } from 'form';
import { toNav } from 'nav';
import { toTag } from 'tag';

const phase_list = [...Array(nPhases).keys()];

const main = () => {
  const data = reactive({
    phaseMap,
    content: '',
    is_event: true,
    phase: 0, err: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    dates: phase_list.map(x => null),
    hasCalendar: () => {
      const cals = ['event', 'start', 'end'];
      return cals.map(label => {
        return isPhase(data.phase, label);
      }).some(x => x);
    },
    hasEditor: () => {
      const eds = ['text', 'review'];
      return eds.map(label => {
        return isPhase(data.phase, label);
      }).some(x => x);
    },
    skipInvalidPhase: (phase) => {
      const event_only = isPhase(phase, 'event');
      if (!data.is_event && event_only) {
        return true;
      }
      return false;
    },
    setPhaseDate: (phase, date) => {
      const idx = (phase) % data.dates.length;
      data.dates[idx] = date;
      // Only error in calendar phase
      if (!data.hasCalendar()) {
        data.err = 0;
      }
      else if (phase === data.phase) {
        data.err = +!date;
      }
    },
    getPhaseDate: (empty) => {
      const idx = (data.phase) % data.dates.length;
      return data.dates[idx] || empty;
    }
  });
  window.addEventListener('resize', handleResize(data));
  document.adoptedStyleSheets = [
    globalCSS, backdropCSS
  ];
  // Date at the top
  const nav = toNav(data);
  // Demo Form
  const eventForm = toEventForm(data, globalCSS);
  // Animated Background
  const backdrop = toBackdrop(data);
  // Containers
  const root = toTag('div')`
    ${nav}${eventForm}
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
