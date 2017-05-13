import query from './query';

export default function closest(target, selector) {
  if (!target) {
    return null;
  }

  let node = query(target);

  while (node) {
    if (node.matches(selector)) {
      return node;
    }

    node = node.parentElement;
  }

  return null;
}
