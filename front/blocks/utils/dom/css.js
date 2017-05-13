import query from './query';

export default function css(target, props) {
  const node = query(target);

  Object.keys(props).forEach((prop) => {
    node.style[prop] = props[prop];
  });

  return node;
}
