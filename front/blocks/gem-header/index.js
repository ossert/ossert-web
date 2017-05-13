import './gem-header.pcss';
import { query, offset } from '../utils/dom';

const header = query('#sticky-project-header');
const fixed = query(header, '.gem-header__fixed');

export function onScroll() {
  if (fixed) {
    fixed.classList.toggle(
      'gem-header__fixed_hidden',
      !isWillBeVisible(document.body.scrollTop - header.offsetHeight - 15)
    );
  }
}

export function getHeight() {
  return fixed ? fixed.offsetHeight : 0;
}

export function isWillBeVisible(targetOffset) {
  return (header ? offset(header).top : 0) < targetOffset;
}
