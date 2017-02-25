import './toggleable.pcss';
import { arrayFromNodes } from '../utils';

export default function init(callback) {
  arrayFromNodes(document.querySelectorAll('[data-toggleable]')).forEach(node => {
    let callbackIsCalled = false;

    node.querySelector('[data-toggleable-toggler]').addEventListener('click', () => {
      node.classList.toggle('toggleable_closed');

      if (!node.classList.contains('toggleable_closed') && !callbackIsCalled) {
        callbackIsCalled = true;
        requestAnimationFrame(() => callback(node));
      }
    });

    if (!node.classList.contains('toggleable_closed')) {
      callback(node);
    }
  });
}
