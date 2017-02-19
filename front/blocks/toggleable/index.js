import './toggleable.pcss';
import { arrayFromNodes } from '../utils';
import RAF from 'raf';

export default function init(callback) {
  arrayFromNodes(document.querySelectorAll('[data-toggleable]')).forEach(node => {
    let callbackIsCalled = false;

    node.querySelector('[data-toggleable-toggler]').addEventListener('click', () => {
      node.classList.toggle('toggleable_closed');

      if (!node.classList.contains('toggleable_closed') && !callbackIsCalled) {
        callbackIsCalled = true;
        RAF(() => callback(node));
      }
    });

    if (!node.classList.contains('toggleable_closed')) {
      callback(node);
    }
  });
}
