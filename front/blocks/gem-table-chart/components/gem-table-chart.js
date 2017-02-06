import Snap from 'snapsvg-cjs';
import rafThrottle from 'raf-throttle';
import { memoize } from 'lodash';
import vars from '../../../postcss/css-vars';

export default class GemTableChart {
  static ID = 0;
  static LINE_COLORS = ['#d0011b', '#4990e2'];
  static SEGMENT_COLORS = {
    a: vars.indicatorRateA,
    b: vars.indicatorRateB,
    c: vars.indicatorRateC,
    d: vars.indicatorRateD,
    e: vars.indicatorRateE
  };
  static VERTICAL_OFFSET = 10;
  static STYLES = {
    VLINE: {
      strokeWidth: 1,
      stroke: '#000000',
      opacity: 0.15
    },
    HOVER_POINT: {
      strokeWidth: 1.5,
      stroke: '#ffffff'
    },
    GRAPH_LINE: {
      DEFAULT: {
        strokeWidth: 0.5
      },
      HOVER: {
        strokeWidth: 1
      }
    }
  };

  constructor(emitter, { width, height, segmentsCount, data }) {
    this.emitter = emitter;
    this.id = ++GemTableChart.ID;

    this.width = width;
    this.height = height;
    this.graphsHeight = height - GemTableChart.VERTICAL_OFFSET * 2;
    this.segmentsCount = segmentsCount;
    this.stepWidth = Math.floor(width / (segmentsCount + 1));
    this.data = data;
    this.isMultiline = this.data.length > 1;
    this.maxValue = this._calcMaxChartValue();
    this.paper = Snap(width, height);
    this.currentIndex = -1;
    this.chartParts = {};
    this.mouseIsOut = true;

    this._buildChart();
  }

  attachTo(node) {
    node.appendChild(this.paper.node);
    return this;
  }

  getValuesAt = memoize((index) => {
    return this.data.map((chart, dataIndex) => {
      if (!chart[index]) {
        return null;
      }

      return { ...chart[index], color: GemTableChart.LINE_COLORS[dataIndex] };
    });
  });

  getTitleAt = (() => {
    const DATE = new Date();
    const YEAR = DATE.getFullYear();
    const MONTH = DATE.getMonth();

    return memoize((index) => {
      if (index >= this.segmentsCount) {
        return null;
      }

      const date = new Date(YEAR, MONTH - ((index + 1) * 3));
      return 'Q' + Math.ceil((date.getMonth() + 1) / 3) + ', ' + date.getFullYear();
    });
  })();

  _calcMaxChartValue() {
    return this.data.reduce((prevMax, oneLineData) => {
      const curMax = Math.max.apply(null, oneLineData.map(pointData => pointData.value));

      if (prevMax < curMax) {
        return curMax;
      }

      return prevMax;
    }, 0);
  }

  _buildChart() {
    this._buildGraphLines();
    this._buildVline();
    this._buildHoverPoints();
    this._setLineVisibility(false);
    this._setupInteractions();
  }

  _buildVline() {
    this.chartParts.vline = this.paper.path(`M 0 0, L 0 ${this.height}`).attr(GemTableChart.STYLES.VLINE);
  }

  _buildHoverPoints() {
    this.chartParts.hoverPoints = this.data.map(() => this.paper
      .circle(0, 0, 3)
      .attr(GemTableChart.STYLES.HOVER_POINT)
    );
  }

  _buildGraphLines() {
    this.chartParts.graphLinesGroup = this.paper
      .group()
      .attr(GemTableChart.STYLES.GRAPH_LINE.DEFAULT);

    this.chartParts.graphLines = this.data.map((lineData, lineIndex) => {
      const lineGroup = this.paper.group();

      this.chartParts.graphLinesGroup.add(lineGroup);

      lineData.forEach((pointData, pointIndex) => {
        const nextPointIndex = pointIndex + 1;
        const nextPoint = lineData[nextPointIndex];

        if (nextPoint) {
          const x1 = this.width - (pointIndex * this.stepWidth) - this.stepWidth / 2;
          const y1 = this._getRelativeHeight(pointData.value);
          const x2 = this.width - (nextPointIndex * this.stepWidth) - this.stepWidth / 2;
          const y2 = this._getRelativeHeight(nextPoint.value);
          const line = this.paper
            .line(x1, y1, x2, y2)
            .attr({ stroke: this._getSegmentColor(lineIndex, pointData.grade) });

          lineGroup.add(line);
        }
      });

      return lineGroup;
    });
  }

  _getSegmentColor(i, grade) {
    return this.isMultiline ? GemTableChart.LINE_COLORS[i] : GemTableChart.SEGMENT_COLORS[grade];
  }

  _setupInteractions() {
    const interactionsOverlay = this.paper
      .rect(0, 0, this.width, this.height)
      .attr({ fill: 'transparent', stroke: 'none' });

    this.emitter.on('over', () => (this.mouseIsOut = false));
    this.emitter.on('show', rafThrottle((graphId, index) => {
      if (!this.mouseIsOut) {
        this._moveLineTo(index);
      }
    }));
    this.emitter.on('out', () => {
      this.mouseIsOut = true;
      this._setLineVisibility(false);
    });

    interactionsOverlay
      .mouseover(() => {
        this.chartParts.graphLinesGroup.attr(GemTableChart.STYLES.GRAPH_LINE.HOVER);
        this.emitter.emit('over');
      })
      .mousemove(e => {
        const index = Math.floor((this.width - e.offsetX) / this.stepWidth);
        this.emitter.emit('show', this.id, index);
      })
      .mouseout(() => {
        this.chartParts.graphLinesGroup.attr(GemTableChart.STYLES.GRAPH_LINE.DEFAULT);
        this.emitter.emit('out', this.id);
      });
  }

  _getRelativeHeight(value) {
    const offset = this.maxValue <= 0 ? 0 : Math.floor(value / this.maxValue * this.graphsHeight);

    return this.graphsHeight - offset + GemTableChart.VERTICAL_OFFSET;
  }

  _setLineVisibility(value, values) {
    this.chartParts.vline.attr({ opacity: value ? GemTableChart.STYLES.VLINE.opacity : 0 });
    this.chartParts.hoverPoints.forEach((point, index) => {
      const show = values ? values[index] : value;
      point.attr({ opacity: show ? 1 : 0 });
    });
  }

  _moveLineTo(index) {
    this.currentIndex = index;
    const values = this.getValuesAt(index);
    const noValues = !values.filter(value => value).length;

    this._setLineVisibility(!noValues, values);

    if (noValues && this.currentIndex === index) {
      return;
    }

    const xOffset = this.width -
      (index * this.stepWidth) -
      (this.stepWidth % 2 ? 0 : GemTableChart.STYLES.VLINE.strokeWidth / 2) -
      this.stepWidth / 2;

    this.chartParts.vline.transform((new Snap.Matrix()).translate(xOffset, 0));
    values.forEach((pointData, i) => {
      if (!pointData) {
        return;
      }

      this.chartParts.hoverPoints[i]
        .attr({ fill: this._getSegmentColor(i, pointData.grade) })
        .transform((new Snap.Matrix()).translate(xOffset, this._getRelativeHeight(pointData.value)));
    });
  }
}
