import $ from 'jquery';
import tooltipTpl from './help-tooltip.mustache';

const $statsTables = $('.gems-stats-table');
const $helpTooltip = $('.help-tooltip');
const $helpTooltipContent = $helpTooltip.find('.help-tooltip__content');
const $helpTooltipArrow = $helpTooltip.find('.help-tooltip__arrow');
const $mutualParent = $helpTooltip.parents('.layout__content-row');
const mutualParentOffset = $mutualParent.offset();
const mutualParentHeight = $mutualParent.height();

export function init() {
  $statsTables.on('mouseenter', '.gems-stats-table__row', function onRowMouseOver() {
    const $this = $(this);

    $helpTooltipContent.html(tooltipTpl($this.data('tooltip')));

    const rowOffset = $this.offset();
    const helpTooltipHeight = $helpTooltip.outerHeight();
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
  });

  $statsTables.on('mouseleave', '.gems-stats-table__row', () => $helpTooltip.addClass('help-tooltip_hidden'));
}
