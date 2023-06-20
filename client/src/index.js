import backdropCSS from 'backdrop-css' assert { type: 'css' };
import globalCSS from 'global-css' assert { type: 'css' };
import { phaseMap, isPhase, nPhases } from 'phases';
import { reactive } from '@arrow-js/core';
import { toBackdrop } from 'backdrop';
import { toActions } from 'actions';
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
    api_root: 'http://localhost:8000',
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
      return [
        data.is_event && isPhase(phase, 'end'),
        !data.is_event && isPhase(phase, 'event')
      ].some(x => x);
    },
    updatePhase: (phase, date) => {
      const n_dates = data.dates.length;
      data.dates[phase % n_dates] = date;
      if (data.phase === phase) {
        data.err = +!date;
      };
    },
    setActiveDate: (date) => {
      data.dates[data.phase] = date;
      // Only error in calendar phase
      if (!data.hasCalendar()) data.err = 0;
      else data.err = +!date;
    },
    getActiveDate: (empty) => {
      const idx = (data.phase) % data.dates.length;
      return data.dates[idx] || empty;
    },
    getMinDate: () => {
      const end_phase = data.phaseMap.end || 0;
      if (data.phase !== end_phase) return null;
      const start_phase = data.phaseMap.start || 0;
      return parseDate(data.dates[start_phase]);
    },
    getMaxDate: () => {
      const start_phase = data.phaseMap.start || 0;
      if (data.phase !== start_phase) return null;
      const event_phase = data.phaseMap.event || 0;
      return parseDate(data.dates[event_phase]);
    }
  });
  const actions = toActions(data);
  window.addEventListener('resize', handleResize(data));
  document.adoptedStyleSheets = [
    globalCSS, backdropCSS
  ];
  // Date at the top
  const nav = toNav(data, actions);
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

const parseDate = (date_string) => {
  if (date_string === null) return null;
  return new Date(Date.parse(date_string));
}

const handleResize = (d) => {
  return () => {
    d.height = window.innerHeight;
    d.width = window.innerWidth;
  }
}

export default main
