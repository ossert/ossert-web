import query from './query';

export default function prependTo(node, target) {
  const targetNode = query(target);

  targetNode.insertBefore(node, targetNode.firstChild);

  return node;
}
