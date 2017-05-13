import './search.pcss';
import { on } from '../utils/dom';

export default (selector) => {
  on(selector, 'submit', e => {
    e.preventDefault();

    const packageName = e.target.package.value.trim();

    if (packageName) {
      window.location = `/search/${packageName}`;
    }
  });
};
