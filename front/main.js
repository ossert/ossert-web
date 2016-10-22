import $ from 'jquery';
import rafThrottle from 'raf-throttle';
import { onScroll } from './blocks/gem-header';
import { init as helpTooltipInit } from './blocks/help-tooltip';
import { draw } from './blocks/gem-stats-chart';
import { smoothAnchorScrolling } from './blocks/link';
import { isMobileView } from './blocks/utils';
import searchForm from './blocks/search';

$(() => {
  if ($('#sticky-project-header').length) {
    $(window).on('scroll', rafThrottle(onScroll));
    onScroll();
  }

  smoothAnchorScrolling();

  if (!isMobileView() && $('.help-tooltip').length) {
    helpTooltipInit();
  }

  searchForm('.search');
  $('.gem-stats-chart').each(function onEachChart() {
    draw(this, $(this).data('columns'));
  });
});
