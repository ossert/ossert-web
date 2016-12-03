import Snap from 'snapsvg-cjs';

const TEXT_HEIGHT = 20;
const MAX_VALUE_HEIGHT_PORTION = 0.85;

export function draw(chartNode, chartData) {
  const chartWidth = chartNode.clientWidth;
  const chartHeight = chartNode.clientHeight;
  const columnWidth = Math.ceil(chartWidth / chartData.length);
  const columnHeight = chartHeight - TEXT_HEIGHT;
  const columnMaxValue = getMaxColumnValue(chartData);

  const paper = Snap(chartWidth, chartHeight);

  // TEXT
  const text = paper.text(chartWidth / 2, (TEXT_HEIGHT / 2));
  text.node.classList.add('gem-stats-chart__column-text');
  text.attr({
    textAnchor: 'middle',
    alignmentBaseline: 'middle',
    opacity: 0
  });

  // BARS

  chartData.forEach((columnData, i) => {
    const offset = i * columnWidth;
    const group = paper.group();
    const rectBack = paper.rect(i * columnWidth, TEXT_HEIGHT, columnWidth, columnHeight);
    const pathCommands = [
      `M ${offset} ${chartHeight}`,
      `L ${offset} ${relativeHeight(columnData.values[0])}`,
      `L ${offset + columnWidth} ${relativeHeight(columnData.values[1])}`,
      `L ${offset + columnWidth} ${chartHeight}`,
      `L ${offset} ${chartHeight}`
    ];
    const path = paper.path(pathCommands.join(' '));

    group.node.classList.add('gem-stats-chart__column');
    group.add(rectBack, path);
    group.attr({ opacity: 0.4 });

    // rect back
    rectBack.node.classList.add('gem-stats-chart__column-back');
    rectBack.node.style.fill = 'currentColor';
    rectBack.attr({ stroke: 'none' });

    // path
    path.node.classList.add('gem-stats-chart__column-bar');
    path.node.classList.add(`gem-stats-chart__column-bar_${columnData.type}`);
    path.node.style.fill = 'currentColor';
    path.attr({ stroke: 'none' });

    group.hover(
      () => {
        text.attr('text', columnData.title);
        text.attr('opacity', 1);
        group.attr('opacity', 1);
      },
      () => {
        text.attr('opacity', 0);
        group.attr('opacity', 0.4);
      }
    );
  });

  chartNode.appendChild(paper.node);

  function relativeHeight(columnValue) {
    return chartHeight - Math.floor((columnValue / columnMaxValue) * columnHeight * MAX_VALUE_HEIGHT_PORTION);
  }
}

function getMaxColumnValue(columnsData) {
  return columnsData.reduce((prevMax, column) => {
    const curMax = Math.max.apply(null, column.values);

    if (prevMax < curMax) {
      return curMax;
    }

    return prevMax;
  }, 0);
}
