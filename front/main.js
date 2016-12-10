import $ from 'jquery';
import rafThrottle from 'raf-throttle';
import { onScroll } from './blocks/gem-header';
import { init as helpTooltipInit } from './blocks/help-tooltip';
import { draw as drawTableMainChart } from './blocks/gem-stats-chart';
import { renderTableCharts } from './blocks/gem-table-chart';
import { smoothAnchorScrolling } from './blocks/link';
import { isMobileView, arrayFromNodes } from './blocks/utils';
import searchForm from './blocks/search';
import { gemDescriptionCollapser } from './blocks/gem';

if (process.env.NODE_ENV === 'development') {
  window.$ = $;
}

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
  gemDescriptionCollapser();
  $('.gem-stats-chart').each(function onEachChart() {
    drawTableMainChart(this, $(this).data('chart'));
  });

  arrayFromNodes(document.querySelectorAll('.js-gems-stats-table')).forEach(table => {
    renderTableCharts({
      titleNode: table.querySelector('.js-gems-stats-table__period-title'),
      chartsNodes: table.querySelectorAll('.js-gems-stats-table__row-chart'),
      statsCellNodes: table.querySelectorAll('.js-gems-stats-table__cell-stats'),
      maxQuarters: JSON.parse(table.dataset.maxQuarters)
    });
  });
});
