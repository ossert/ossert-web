import './search.pcss';
import $ from 'jquery';

export default (selector) => {
  $(selector).on('submit', e => {
    e.preventDefault();

    const packageName = e.target.package.value.trim();

    if (packageName) {
      window.location = `/search/${packageName}`;
    }
  });
};
