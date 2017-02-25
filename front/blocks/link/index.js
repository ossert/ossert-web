import './link.pcss';
import { qsa, offset, animate, on } from '../utils/dom';
import { isWillBeVisible as headerWillBeVisible, getHeight as getHeaderHeight } from '../gem-header';

const CONST_OFFSET = 15;

export function smoothAnchorScrolling() {
  qsa('a[href*="#"]:not([href="#"])').forEach((node) => {
    on(node, 'click', () => {
      if (
        location.pathname.replace(/^\//, '') === node.pathname.replace(/^\//, '')
        && location.hostname === node.hostname
      ) {
        const target = document.querySelector(node.hash);

        if (target) {
          const scrollOffset = offset(target).top;
          const offsetHeight = headerWillBeVisible(scrollOffset) ? getHeaderHeight() + CONST_OFFSET : 0;

          animate(document.body, { scrollTop: scrollOffset - offsetHeight }, 500);
        }
      }
    });
  });
}
