import Raphael from 'raphael';

const TEXT_HEIGHT = 20;
const MAX_VALUE_HEIGHT_PORTION = 0.85;

export function draw(chartNode, columnsData) {
  const chartWidth = chartNode.clientWidth;
  const chartHeight = chartNode.clientHeight;
  const columnWidth = Math.ceil(chartWidth / columnsData.length);
  const columnHeight = chartHeight - TEXT_HEIGHT;
  const columnMaxValue = getMaxColumnValue(columnsData);

  const paper = Raphael(chartNode, chartWidth, chartHeight);
  const text = createText(paper, chartWidth);

  columnsData.forEach((columnData, i) => {
    const offset = i * columnWidth;
    const set = paper.set();
    const rectBack = paper.rect(i * columnWidth, TEXT_HEIGHT, columnWidth, columnHeight);
    const pathCommands = [
      `M ${offset} ${chartHeight}`,
      `L ${offset} ${relativeHeight(columnData.values[0])}`,
      `L ${offset + columnWidth} ${relativeHeight(columnData.values[1])}`,
      `L ${offset + columnWidth} ${chartHeight}`,
      `L ${offset} + ${chartHeight}`
    ];
    const path = paper.path(pathCommands.join(' '));

    set.push(rectBack, path);
    set.attr({ opacity: 0.4 });

    // rect back
    rectBack.node.classList.add('gem-stats-chart__column-back');
    rectBack.node.style.fill = 'currentColor';
    rectBack.attr({ stroke: 'none' });

    // path
    path.node.classList.add('gem-stats-chart__column');
    path.node.classList.add(`gem-stats-chart__column_${columnData.type}`);
    path.node.style.fill = 'currentColor';
    path.attr({ stroke: 'none' });

    set.hover(
      () => {
        text.attr('text', columnData.title);
        text.attr('opacity', 1);
        set.attr('opacity', 1);
      },
      () => {
        text.attr('opacity', 0);
        set.attr('opacity', 0.4);
      }
    );
  });

  function relativeHeight(columnValue) {
    return chartHeight - Math.floor((columnValue / columnMaxValue) * columnHeight * MAX_VALUE_HEIGHT_PORTION);
  }
}

function getMaxColumnValue(columnsData) {
  return columnsData.reduce((prevMax, column) => {
    const curMax = Math.max.apply(Math, column.values);

    if (prevMax < curMax) {
      return curMax;
    }

    return prevMax;
  }, 0);
}

function createText(paper, chartWidth) {
  const text = paper.text(chartWidth / 2, (TEXT_HEIGHT / 2) - 2);

  text.node.classList.add('gem-stats-chart__column-text');
  text.node.style.font = null;
  text.node.attributes.removeNamedItem('font-family');
  text.node.attributes.removeNamedItem('font-size');
  text.attr({
    textAnchor: 'middle',
    opacity: 0
  });

  return text;
}
