export default function queryAll(node, selector) {
  if (!node) {
    return [];
  }

  if (selector === undefined) {
    selector = node;
    node = document;
  }

  return Array.from(node.querySelectorAll(selector));
}
