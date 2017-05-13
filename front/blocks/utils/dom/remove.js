import query from './query';

export default function remove(target) {
  const node = query(target);

  if (node) {
    node.parentNode.removeChild(node);
  }
}
