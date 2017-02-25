export default function css(element, props) {
  Object.keys(props).forEach((prop) => {
    element.style[prop] = props[prop];
  });

  return element;
}
