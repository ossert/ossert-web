import './gem-table-chart.pcss';
import GemTableChart from './components/gem-table-chart';
import NanoEvents from 'nanoevents';
import { renderGemTableChartStats } from '../gem-table-chart-stats';
import { arrayFromNodes } from '../utils';

export default GemTableChart;

export function renderTableCharts({ chartsNodes, statsCellNodes, maxQuarters, onShow, onOut }) {
  chartsNodes = arrayFromNodes(chartsNodes);
  statsCellNodes = arrayFromNodes(statsCellNodes);

  const emitter = new NanoEvents();
  const tableCharts = [];
  const parsedYearValues = chartsNodes.map(chart => JSON.parse(chart.dataset.yearValues));

  chartsNodes.forEach(chartNode => {
    const chart = new GemTableChart(emitter, {
      width: chartNode.clientWidth,
      height: chartNode.clientHeight,
      data: JSON.parse(chartNode.dataset.chart),
      segmentsCount: maxQuarters
    });
    tableCharts.push(chart.attachTo(chartNode));
  });

  setYearValues();

  emitter.on('show', (graphId, index) => {
    onShow(tableCharts[0].getTitleAt(index));
    tableCharts.forEach((chart, i) => renderGemTableChartStats(
      statsCellNodes[i],
      parsedYearValues[i],
      chart.getValuesAt(index)
    ));
  });
  emitter.on('out', () => {
    setYearValues();
    onOut();
  });

  function setYearValues() {
    statsCellNodes.forEach((statsCell, i) => renderGemTableChartStats(statsCell, parsedYearValues[i]));
  }
}
