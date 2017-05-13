import './link.pcss';

import { offset, animate, on } from '../utils/dom';
import { isWillBeVisible as headerWillBeVisible, getHeight as getHeaderHeight } from '../gem-header';

const PERMANENT_OFFSET = 15;

export function smoothAnchorScrolling() {
  on('a[href*="#"]:not([href="#"])', 'click', (e) => {
    e.preventDefault();

    if (
      location.pathname.replace(/^\//, '') === e.delegatedTarget.pathname.replace(/^\//, '')
      && location.hostname === e.delegatedTarget.hostname
    ) {
      const scrollOffset = offset(e.delegatedTarget.hash).top;
      const offsetHeight = headerWillBeVisible(scrollOffset) ? getHeaderHeight() + PERMANENT_OFFSET : 0;

      animate(document.body, { scrollTop: scrollOffset - offsetHeight }, 500);
    }
  });
}
