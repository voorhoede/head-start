import type { Data, ThemeName } from '../';
import type { LineSeriesOption } from 'echarts';
import * as echarts from 'echarts/core';
import { AriaComponent, GridComponent, LegendComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { SVGRenderer } from 'echarts/renderers';
import { getThemeColors, themeNames /*, valueFormatter*/ } from '../';
import { $highContrast } from '../ChartBlock.client';

echarts.use([
  AriaComponent,
  LineChart,
  GridComponent,
  LegendComponent,
  LabelLayout,
  SVGRenderer,
]);

// ECharts has limited built-ins, so we use SVG paths for extra distinct symbols.
const symbols: string[] = [
  'circle',
  'rect',
  'triangle',
  'diamond',
  'pin',
  'arrow',
  'roundRect',
  // Star SVG
  'path://M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  // X (Cross) SVG
  'path://M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  // Plus SVG
  'path://M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  // Heart SVG
  'path://M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  // Triangle pointing down SVG
  'path://M12 2L2 22h20L12 2z'
];

// Type definition ensures we can mix strings ('solid') and number arrays ([5,5])
// @ts-expect-error fix me
const dashPatterns: (LineSeriesOption['lineStyle']['type'])[] = [
  'solid',          // 1. Solid
  'dotted',         // 2. Standard dots
  [10, 5],          // 3. Long dash
  [5, 5],           // 4. Medium dash
  [15, 3, 3, 3],    // 5. Dash-dot
  [2, 2, 10, 2],    // 6. Short-short-long
  [20, 10],         // 7. Very long dash, long gap
  [1, 5],           // 8. Sparse dots
  [5, 2, 5, 2, 2, 2], // 9. Dash-dash-dot
  [30, 5, 2, 5],    // 10. Super long dash, dot
  [8, 3, 8, 3, 2, 3], // 11. Balanced dash-dash-dot
  [15, 5, 15, 5, 2, 5] // 12. Long-long-short
];

const readJsonData = (script: HTMLScriptElement): Data | null => {
  try {
    const data: Data = JSON.parse(script.innerText);
    return data;
  } catch (error) {
    console.warn('BarChart: script element does not contain valid JSON', script.innerText, error);
    return null;
  }
};

class LineChartComponent extends HTMLElement {
  #canvas?: HTMLElement;
  #chart?: echarts.ECharts;
  #data?: Data;
  #theme: ThemeName | null = null;
  // #valuePrefix: string | null = null;
  // #valueSuffix: string | null = null;
  // #valuePrecision: number | null = null;

  constructor() {
    super();
    this.#canvas = this.querySelector('[data-canvas]') as HTMLElement;
    this.#theme = this.dataset.theme && themeNames.includes(this.dataset.theme as ThemeName) ? (this.dataset.theme as ThemeName) : themeNames[0];
    // this.#valuePrefix = this.dataset.valuePrefix ?? null;
    // this.#valueSuffix = this.dataset.valueSuffix ?? null;
    // this.#valuePrecision = this.dataset.valuePrecision ? Number(this.dataset.valuePrecision) : null;

    const script = this.querySelector('script[data-chart-data]') as HTMLScriptElement;
    if (!script) {
      console.warn('LineChart: missing required script element', this);
      return;
    }
    const data = readJsonData(script);
    if (!data) {
      return;
    }
    this.#data = {
      columns: data.columns,
      data: data.data.reverse(),
    };
  }

  connectedCallback() {
    if (!this.#canvas || !this.#data) {
      console.warn('BarChart: missing canvas element or data', this);
      return;
    }
    this.#chart = echarts.init(this.#canvas, null, { renderer: 'svg' });

    window.addEventListener('resize', this.#onResize());
    $highContrast.listen(() => this.#render());
    this.#render();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.#onResize());
    this.#chart?.dispose();
  }

  #onResize() {
    let resizeTimeout: number;
    return () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        this.#chart?.resize();
      }, 200);
    };
  }

  #dataToSeries(data: Data) {
    const { columns, data: entries } = data;
    const [entryNameKey, ...serieNames] = columns;

    console.log({ entries }, entryNameKey, serieNames);

    // const formatValue = valueFormatter({ 
    //   prefix: this.#valuePrefix, 
    //   suffix: this.#valueSuffix, 
    //   precision: this.#valuePrecision,
    // });
    const isHighContrastMode = $highContrast.get().isEnabled;
    const themeColors = getThemeColors(this.#theme, entries.length);
    const itemStyle = {
    };

    const series = serieNames.map((name, serieIndex) => ({
      name,
      type: 'line',
      animation: false,
      smooth: false,
      data: entries.map(entry => ({
        name: entry[entryNameKey], 
        value: Number(entry[name]),
        label: {
          show: true,
          position: Number(entry[name]) < 0 ? 'left' : 'right',
        }
      })),
      symbol: symbols[serieIndex % symbols.length],
      symbolSize: 10, // Make them large enough to see clearly

      // DISTINCT LINE STYLE (DASH PATTERN) CONFIGURATION
      lineStyle: {
        width: 2,
        // Cycling through dash patterns based on index
        type: dashPatterns[serieIndex % dashPatterns.length]
      },
      itemStyle: isHighContrastMode
        ? {
          ...itemStyle,
          borderColor: 'black',
          borderWidth: 2,
          color: 'rgb(225,225,225)',
          decal: {
            color: 'black'
          },
        }
        : {
          ...itemStyle,
          color: themeColors[serieIndex],
          borderWidth: 0,
          decal: false,
        },
      emphasis: {
        focus: 'self'
      },
      // LABEL AT END
      endLabel: {
        show: true,
        formatter: '{a}',
        distance: 10,
        fontWeight: 'bold',
        color: 'inherit'
      },
      label: {
        show: false
      },
      // label: {
      //   fontSize: 16,
      //   // fontWeight: 'bold',
      //   color: 'black',
      //   formatter: (params: { name: string; value: number }) => {
      //     return formatValue(params.value);
      //   },
      // },
    }));
    return series;
  }

  #render() {
    if (!this.#chart || !this.#data) {
      return;
    }

    const [entryNameKey, ...columnNames] = this.#data.columns;
    const rowNames = this.#data.data.map(entry => entry[entryNameKey]);
    const isHighContrastMode = $highContrast.get().isEnabled;
    const noMerge = true;

    console.log({ columnNames, rowNames });

    this.#chart.setOption({
      aria: {
        enabled: true,
        decal: {
          show: isHighContrastMode,
        }
      },
      label: {
        show: true,
      },
      legend: {
        data: rowNames,
        textStyle: { color: 'black', fontSize: 16 },
      },
      // @todo: make orientation configurable, vertical for now
      yAxis: {
        name: entryNameKey,
        type: 'value',
      },
      xAxis: {
        type: 'category',
        data: columnNames,
        // data: rowNames,
        // name: entryNameKey,
        // nameTextStyle: {
        //   fontSize: 16,
        //   fontWeight: 'bold',
        //   color: 'black',
        // },
        // axisLabel: {
        //   fontSize: 16,
        //   fontWeight: 'bold',
        //   color: 'black',
        // },
      },
      series: this.#dataToSeries(this.#data),
    }, noMerge);
  }
}

customElements.define('line-chart', LineChartComponent);
