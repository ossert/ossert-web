import $ from 'jquery';
import { isWillBeVisible as headerWillBeVisible, getHeight as getHeaderHeight } from '../gem-header';

const CONST_OFFSET = 15;

export function smoothAnchorScrolling() {
  const $htmlBody = $('html, body');

  $('a[href*="#"]:not([href="#"])').on('click', function onClick() {
    if (
      location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '')
      && location.hostname === this.hostname
    ) {
      const $target = $(this.hash);
      const scrollOffset = $target.offset().top;
      const offsetHeight = headerWillBeVisible(scrollOffset) ? getHeaderHeight() + CONST_OFFSET : 0;

      if ($target.length) {
        $htmlBody.stop().animate({ scrollTop: scrollOffset - offsetHeight }, 500);
      }
    }
  });
}
