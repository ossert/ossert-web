export default function query(node, selector) {
  if (!node) {
    return null;
  }

  if (selector === undefined) {
    if (node instanceof Node) {
      return node;
    }

    selector = node;
    node = document;
  }

  if (selector instanceof Node) {
    return selector;
  }

  return node.querySelector(selector);
}
