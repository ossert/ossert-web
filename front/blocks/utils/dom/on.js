import query from './query';
import closest from './closest';

export default function on(target, eventName, selector, handler, useCapture = false) {
  const node = (target instanceof Window || target instanceof Document) ? target : query(target);

  if (!handler && typeof selector === 'function') {
    node.addEventListener(eventName, selector, useCapture);

    return () => node.removeEventListener(eventName, selector, useCapture);
  }

  const eventHandler = (event) => {
    const selectorNode = closest(event.target, selector);

    if (selectorNode) {
      event.delegatedTarget = selectorNode;
      handler(event);
    }
  };
  node.addEventListener(eventName, eventHandler, useCapture);

  return () => node.removeEventListener(eventName, eventHandler, useCapture);
}
