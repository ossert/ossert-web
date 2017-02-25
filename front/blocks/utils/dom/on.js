import select from './_select';

export default function on(target, event, handler) {
  return select(target).addEventListener(event, handler);
}
