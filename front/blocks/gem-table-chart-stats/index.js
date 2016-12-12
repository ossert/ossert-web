import template from './gem-table-chart-stats.mustache';
import GemTableChart from '../gem-table-chart';

export function renderGemTableChartStats(node, yearValues, values) {
  values = values && values.filter(value => value).length ? values : yearValues;

  const preparedValues = values.map((line, index) => ({
    title: line && line.title,
    grade: line && line.grade,
    GRADE: line && line.grade.toUpperCase(),
    color: GemTableChart.LINE_COLORS[index]
  }));

  node.innerHTML = template({
    values: preparedValues,
    isMultiple: values.length > 1
  });
}
