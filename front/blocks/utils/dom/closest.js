export default function closest(elem, selector) {
  while (elem) {
    if (elem.matches(selector)) {
      return elem;
    }

    elem = elem.parentElement;
  }

  return null;
}
