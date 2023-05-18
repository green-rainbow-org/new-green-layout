const phases = [
  'home', 'text', 'start', 'end', 'review'
];
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
  isPhase, isFirstPhase, isLastPhase,
  backPhase, nextPhase
};
