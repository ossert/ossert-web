import GemTableChart from './components/gem-table-chart';
import NanoEvents from 'nanoevents';
import { renderGemTableChartStats } from '../gem-table-chart-stats';
import { arrayFromNodes } from '../utils';

export default GemTableChart;

export function renderTableCharts({ titleNode, chartsNodes, statsCellNodes, maxQuarters }) {
  chartsNodes = arrayFromNodes(chartsNodes);
  statsCellNodes = arrayFromNodes(statsCellNodes);

  const emitter = new NanoEvents();
  const tableCharts = [];
  const parsedYearValues = chartsNodes.map(chart => JSON.parse(chart.dataset.yearValues).map(preparePointData));

  chartsNodes.forEach(chartNode => {
    const chart = new GemTableChart(emitter, {
      width: chartNode.clientWidth,
      height: chartNode.clientHeight,
      data: JSON.parse(chartNode.dataset.chart).map(lineData => lineData.map(preparePointData)),
      segmentsCount: maxQuarters
    });
    tableCharts.push(chart.attachTo(chartNode));
  });

  setYearValues();

  emitter.on('show', (graphId, index) => {
    setTitle(tableCharts[0].getTitleAt(index) || 'This year');
    tableCharts.forEach((chart, i) => renderGemTableChartStats(
      statsCellNodes[i],
      parsedYearValues[i],
      chart.getValuesAt(index)
    ));
  });
  emitter.on('out', () => {
    setYearValues();
    setTitle('This year');
  });

  function setTitle(value) {
    titleNode.textContent = value;
  }

  function setYearValues() {
    statsCellNodes.forEach((statsCell, i) => renderGemTableChartStats(statsCell, parsedYearValues[i]));
  }
}

const GRADE_VALUES = { a: 5, b: 4, c: 3, d: 2, e: 1 };

function preparePointData(pointData) {
  if (typeof pointData.value === 'number') {
    return { ...pointData, title: pointData.value };
  }

  return { ...pointData, title: pointData.value, value: GRADE_VALUES[pointData.grade] };
}
