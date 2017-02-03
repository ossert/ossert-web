import $ from 'jquery';
import tooltipTpl from './help-tooltip.mustache';

const $body = $(document.body);
const $statsTables = $('.gems-stats-table');
const $helpTooltip = $('.help-tooltip');
const $helpTooltipContent = $helpTooltip.find('.help-tooltip__content');
const $helpTooltipArrow = $helpTooltip.find('.help-tooltip__arrow');
const $sidebar = $helpTooltip.parents('.layout__sidebar-section');
const $mutualParent = $sidebar.parents('.layout__content-row');
let $currentRow;
let currentMode;

export const MODE = { YEAR: 'year', QUARTER: 'quarter' };

export function init() {
  currentMode = MODE.YEAR;

  $statsTables.on('mouseenter', '.gems-stats-table__row', function onRowMouseOver() {
    $currentRow = $(this);
    renderRowTooltip($currentRow, currentMode);
  });

  $statsTables.on('mouseleave', '.gems-stats-table__row', () => {
    $helpTooltip.addClass('help-tooltip_hidden');
    $currentRow = null;
  });
}

export function setMode(mode) {
  currentMode = mode;

  if ($currentRow) {
    renderRowTooltip($currentRow, mode);
  }
}

function renderRowTooltip($row, mode) {
  const mutualParentOffset = $mutualParent.offset();
  const mutualParentHeight = $mutualParent.height();

  $helpTooltipContent.html(tooltipTpl({
    yearMode: mode === MODE.YEAR,
    quarterMode: mode === MODE.QUARTER,
    tooltip: $row.data('tooltip')
  }));

  const rowOffset = $row.offset();
  const helpTooltipHeight = getHeight($helpTooltip.clone().css({ width: $sidebar.width() }));
  let relativeRowOffsetTop = rowOffset.top - mutualParentOffset.top;
  let arrowOffset = mutualParentHeight - helpTooltipHeight - relativeRowOffsetTop;

  if (arrowOffset > 0) {
    arrowOffset = 0;
  } else {
    relativeRowOffsetTop = mutualParentHeight - helpTooltipHeight;
    arrowOffset = -arrowOffset;
  }

  $helpTooltip.css({ top: `${relativeRowOffsetTop}px` });
  $helpTooltipArrow.css({ top: `${arrowOffset}px` });
  $helpTooltip.removeClass('help-tooltip_hidden');
}

function getHeight($tooltip) {
  const $cloned = $tooltip
    .css({
      display: 'block',
      visibility: 'hidden',
      position: 'absolute',
      top: 0
    })
    .appendTo($body);

  const height = $cloned.outerHeight();
  $cloned.remove();
  return height;
}
