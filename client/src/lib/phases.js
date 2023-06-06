const phases = [
  'welcome', 'event', 'text', 'start', 'end', 'review'
];
const phaseMap = phases.reduce((o, label, phase) => {
  return { ...o, [label]: phase };
}, {});
const nPhases = phases.length;
const maxPhase = nPhases - 1;
const isPhase = (phase, label) => {
  return phases[phase] === label;
}
const isFirstPhase = phase => phase === 0;
const isLastPhase = phase => phase === maxPhase;
const backPhase = phase => Math.max(phase - 1, 0);
const nextPhase = phase => Math.min(phase + 1, maxPhase);

export {
  phases, isPhase, isFirstPhase, isLastPhase,
  backPhase, nextPhase, nPhases, phaseMap
};
