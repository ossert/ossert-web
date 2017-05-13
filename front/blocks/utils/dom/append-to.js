import query from './query';

export default function appendTo(node, target) {
  query(target).appendChild(node);

  return node;
}
