export default function create(tag, attrs) {
  const element = document.createElement(tag);

  if (attrs) {
    Object.keys(attrs).forEach(attr => {
      switch (attr) {
        case 'text':
          element.textContent = attrs[attr];
          break;
        case 'html':
          element.innerHTML = attrs[attr];
          break;
        default:
          element[attr] = attrs[attr];
      }
    });
  }

  return element;
}
