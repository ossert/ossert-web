import './help-tooltip.pcss';
import { qs, qsa, closest, offset, css } from '../utils/dom';
import tooltipTpl from './help-tooltip.mustache';

const statsTables = qsa('.gems-stats-table');
const helpTooltip = qs('.help-tooltip');
const helpTooltipContent = helpTooltip && helpTooltip.querySelector('.help-tooltip__content');
const helpTooltipArrow = helpTooltip && helpTooltip.querySelector('.help-tooltip__arrow');
const sidebar = helpTooltip && closest(helpTooltip, '.layout__sidebar-section');
const mutualParent = helpTooltip && closest(sidebar, '.layout__content-row');
let currentRow = null;
let currentMode = null;

export const MODE = { YEAR: 'year', QUARTER: 'quarter' };

export function init() {
  currentMode = MODE.YEAR;

  statsTables.forEach(node => {
    const rows = Array.from(node.querySelectorAll('.gems-stats-table__row'));

    rows.forEach((row) => {
      row.addEventListener('mouseenter', () => {
        currentRow = row;
        renderRowTooltip(row, currentMode);
      });

      row.addEventListener('mouseleave', () => {
        helpTooltip.classList.add('help-tooltip_hidden');
        currentRow = null;
      });
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

  document.body.appendChild(tooltip);

  const height = tooltip.offsetHeight;
  document.body.removeChild(tooltip);
  return height;
}
