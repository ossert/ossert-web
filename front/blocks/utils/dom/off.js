import select from './_select';

export default function off(target, event, handler) {
  return select(target).removeEventListener(event, handler);
}
