import './blocks/global';
import './blocks/vendors';
import './blocks/footer';
import { gemDescriptionCollapser } from './blocks/gem';
import { onScroll } from './blocks/gem-header';
import './blocks/gem-main-stats';
import './blocks/gem-stats';
import { draw as drawTableMainChart } from './blocks/gem-stats-chart';
import { renderTableCharts } from './blocks/gem-table-chart';
import './blocks/gem-table-chart-stats';
import './blocks/gems-list';
import './blocks/gems-stats-table';
import './blocks/header';
import { init as helpTooltipInit, setMode as setTooltipMode, MODE } from './blocks/help-tooltip';
import './blocks/icon';
import './blocks/layout';
import { smoothAnchorScrolling } from './blocks/link';
import './blocks/logo';
import './blocks/mark-text';
import './blocks/page-index';
import './blocks/page-search-results';
import './blocks/polyfills';
import './blocks/raf';
import searchForm from './blocks/search';
import initToggleable from './blocks/toggleable';
import { isMobileView, DOM } from './blocks/utils';
import './blocks/width-container';

import $ from 'jquery';
import rafThrottle from 'raf-throttle';

if (__DEVELOPMENT__) {
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

  initToggleable((toggleable) => {
    const stickyHeaderTitle = document.querySelector('#sticky-header-title');
    const table = toggleable.querySelector('.js-gems-stats-table');
    const tablePeriodTitle = table.querySelector('.js-gems-stats-table__period-title');
    const tableStatsType = DOM.closest(table, '.gem-stats');

    renderTableCharts({
      chartsNodes: table.querySelectorAll('.js-gems-stats-table__row-chart'),
      statsCellNodes: table.querySelectorAll('.js-gems-stats-table__cell-stats'),
      maxQuarters: JSON.parse(table.dataset.maxQuarters),
      onShow: value => (value ? setQuarterMode(value) : setYearMode()),
      onOut: setYearMode
    });

    function setQuarterMode(value) {
      setTooltipMode(MODE.QUARTER);
      stickyHeaderTitle.textContent = `${tableStatsType.dataset.title}${value ? ` - ${value}` : ''}`;
      tablePeriodTitle.textContent = value;
    }

    function setYearMode() {
      setTooltipMode(MODE.YEAR);
      stickyHeaderTitle.textContent = '';
      tablePeriodTitle.textContent = 'This year';
    }
  });
});
