import './help-tooltip.pcss';
import { query, queryAll, on, closest, offset, css, appendTo, remove } from '../utils/dom';
import tooltipTpl from './help-tooltip.mustache';

const statsTables = queryAll('.gems-stats-table');
const helpTooltip = query('.help-tooltip');
const helpTooltipContent = query(helpTooltip, '.help-tooltip__content');
const helpTooltipArrow = query(helpTooltip, '.help-tooltip__arrow');
const sidebar = closest(helpTooltip, '.layout__sidebar-section');
const mutualParent = closest(sidebar, '.layout__content-row');
let currentRow = null;
let currentMode = null;

export const MODE = { YEAR: 'year', QUARTER: 'quarter' };

export function init() {
  currentMode = MODE.YEAR;

  statsTables.forEach(table => {
    on(table, 'mouseover', '.gems-stats-table__row', (e) => {
      currentRow = e.delegatedTarget;
      renderRowTooltip(currentRow, currentMode);
    });

    on(table, 'mouseout', '.gems-stats-table__row', () => {
      helpTooltip.classList.add('help-tooltip_hidden');
      currentRow = null;
    });
  });
}

export function setMode(mode) {
  const oldMode = currentMode;
  currentMode = mode;

  if (currentRow && oldMode !== mode) {
    renderRowTooltip(currentRow, mode);
  }
}

function renderRowTooltip(row, mode) {
  const mutualParentOffset = offset(mutualParent);
  const mutualParentHeight = mutualParent.offsetHeight;

  helpTooltipContent.innerHTML = tooltipTpl({
    yearMode: mode === MODE.YEAR,
    quarterMode: mode === MODE.QUARTER,
    tooltip: JSON.parse(row.dataset.tooltip)
  });

  const rowOffset = offset(row);
  const helpTooltipHeight = getHeight(css(helpTooltip.cloneNode(true), { width: `${sidebar.offsetWidth}px` }));
  let relativeRowOffsetTop = rowOffset.top - mutualParentOffset.top;
  let arrowOffset = mutualParentHeight - helpTooltipHeight - relativeRowOffsetTop;

  if (arrowOffset > 0) {
    arrowOffset = 0;
  } else {
    relativeRowOffsetTop = mutualParentHeight - helpTooltipHeight;
    arrowOffset = -arrowOffset;
  }

  css(helpTooltip, { top: `${relativeRowOffsetTop}px` });
  css(helpTooltipArrow, { top: `${arrowOffset}px` });
  helpTooltip.classList.remove('help-tooltip_hidden');
}

function getHeight(tooltip) {
  css(tooltip, {
    display: 'block',
    visibility: 'hidden',
    position: 'absolute',
    top: 0
  });

  const height = appendTo(tooltip, document.body).offsetHeight;

  remove(tooltip);

  return height;
}
