import { reactive } from '@arrow-js/core';
import { Square } from 'square';
import { toTag } from 'tag';

const main = () => {
  const id = 'root';
  const colors = ['green', 'maroon'];
  const greetings = ['Green', 'Red'];
  const data = reactive({ i: 0, l: '100' });
  const props = { 
    l: ({l}) => l, c: ({i}) => colors[i % 2],
    text: ({ i }) => greetings[i % 2],
    data, "@click": () => {
      data.i += 1;
    }
  };
  // The square greeting reacts to user input
  const el = document.getElementById(id);
  toTag('square', Square)``(props)(el);
}

export default main
