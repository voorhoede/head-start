import type { Data, ThemeName } from '../';
import * as echarts from 'echarts/core';
import { AriaComponent, GridComponent, LegendComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { SVGRenderer } from 'echarts/renderers';
import { getThemeColors, themeNames, valueFormatter } from '../';
import { $highContrast } from '../ChartBlock.client';

echarts.use([
  AriaComponent,
  BarChart,
  GridComponent,
  LegendComponent,
  LabelLayout,
  SVGRenderer,
]);

const readJsonData = (script: HTMLScriptElement): Data | null => {
  try {
    const data: Data = JSON.parse(script.innerText);
    return data;
  } catch (error) {
    console.warn('BarChart: script element does not contain valid JSON', script.innerText, error);
    return null;
  }
};

class BarChartComponent extends HTMLElement {
  #canvas?: HTMLElement;
  #chart?: echarts.ECharts;
  #data?: Data;
  #theme: ThemeName | null = null;
  #valuePrefix: string | null = null;
  #valueSuffix: string | null = null;
  #valuePrecision: number | null = null;

  constructor() {
    super();
    this.#canvas = this.querySelector('[data-canvas]') as HTMLElement;
    this.#theme = this.dataset.theme && themeNames.includes(this.dataset.theme as ThemeName) ? (this.dataset.theme as ThemeName) : themeNames[0];
    this.#valuePrefix = this.dataset.valuePrefix ?? null;
    this.#valueSuffix = this.dataset.valueSuffix ?? null;
    this.#valuePrecision = this.dataset.valuePrecision ? Number(this.dataset.valuePrecision) : null;

    const script = this.querySelector('script[data-chart-data]') as HTMLScriptElement;
    if (!script) {
      console.warn('BarChart: missing required script element', this);
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

    const formatValue = valueFormatter({ 
      prefix: this.#valuePrefix, 
      suffix: this.#valueSuffix, 
      precision: this.#valuePrecision,
    });
    const isHighContrastMode = $highContrast.get().isEnabled;
    const themeColors = getThemeColors(this.#theme, entries.length);
    const itemStyle = {
      
    };

    const series = serieNames.map((name, serieIndex) => ({
      name,
      type: 'bar',
      animation: false,
      data: entries.map(entry => ({
        name: entry[entryNameKey], 
        value: Number(entry[name]),
        label: {
          show: true,
          position: Number(entry[name]) < 0 ? 'left' : 'right',
        }
      })),
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
      label: {
        fontSize: 16,
        // fontWeight: 'bold',
        color: 'black',
        formatter: (params: { name: string; value: number }) => {
          return formatValue(params.value);
        },
      },
    }));
    return series;
  }

  #render() {
    if (!this.#chart || !this.#data) {
      return;
    }

    const entryNameKey = this.#data.columns[0];
    const rowNames = this.#data.data.map(entry => entry[entryNameKey]);
    const isHighContrastMode = $highContrast.get().isEnabled;
    const noMerge = true;

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
        textStyle: { color: 'black', fontSize: 16 },
      },
      // @todo: make orientation configurable, vertical for now
      xAxis: {
        type: 'value',
      },
      yAxis: {
        type: 'category',
        data: rowNames,
        name: entryNameKey,
        nameTextStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: 'black',
        },
        axisLabel: {
          fontSize: 16,
          fontWeight: 'bold',
          color: 'black',
        },
      },
      series: this.#dataToSeries(this.#data),
    }, noMerge);
  }
}

customElements.define('bar-chart', BarChartComponent);
