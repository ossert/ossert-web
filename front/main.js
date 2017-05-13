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
import './blocks/call-to-action';
import { init as helpTooltipInit, setMode as setTooltipMode, MODE } from './blocks/help-tooltip';
import './blocks/icon';
import './blocks/layout';
import { smoothAnchorScrolling } from './blocks/link';
import './blocks/logo';
import './blocks/mark-text';
import './blocks/page-index';
import './blocks/page-search-results';
import './blocks/page-show';
import searchForm from './blocks/search';
import initToggleable from './blocks/toggleable';
import { isMobileView } from './blocks/utils';
import { queryAll, query, on, closest } from './blocks/utils/dom';
import './blocks/width-container';

import rafThrottle from 'raf-throttle';


on(document, 'DOMContentLoaded', () => {
  if (query('#sticky-project-header')) {
    on(window, 'scroll', rafThrottle(onScroll));
    onScroll();
  }

  smoothAnchorScrolling();

  if (!isMobileView() && query('.help-tooltip')) {
    helpTooltipInit();
  }

  searchForm('.search');
  gemDescriptionCollapser();
  queryAll('.gem-stats-chart').forEach(function onEachChart(node) {
    drawTableMainChart(node, JSON.parse(node.dataset.chart));
  });

  initToggleable((toggleable) => {
    const stickyHeaderTitle = query('#sticky-header-title');
    const table = query(toggleable, '.js-gems-stats-table');
    const tablePeriodTitle = query(table, '.js-gems-stats-table__period-title');
    const tableStatsType = closest(table, '.gem-stats');

    renderTableCharts({
      chartsNodes: queryAll(table, '.js-gems-stats-table__row-chart'),
      statsCellNodes: queryAll(table, '.js-gems-stats-table__cell-stats'),
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
