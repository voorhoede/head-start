import type { Data, ThemeName } from '../';
import * as echarts from 'echarts/core';
import { AriaComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { SVGRenderer } from 'echarts/renderers';
import { getThemeColors, themeNames, valueFormatter } from '../';
import { $highContrast } from '../ChartBlock.client';

echarts.use([
  AriaComponent,
  PieChart,
  SVGRenderer,
  LabelLayout
]);

const readJsonData = (script: HTMLScriptElement): Data | null => {
  try {
    const data: Data = JSON.parse(script.innerText);
    return data;
  } catch (error) {
    console.warn('PieChart: script element does not contain valid JSON', script.innerText, error);
    return null;
  }
};

class PieChartComponent extends HTMLElement {
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
      console.warn('PieChart: missing required script element', this);
      return;
    }
    const data = readJsonData(script);
    if (!data) {
      return;
    }
    this.#data = data;
  }

  connectedCallback() {
    if (!this.#canvas || !this.#data) {
      console.warn('PieChart: missing canvas element or data', this);
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
      borderRadius: 10,
    };

    const series = serieNames.map(name => ({
      name,
      type: 'pie',
      radius: ['30%', '60%'],
      animation: false,
      avoidLabelOverlap: false,
      data: entries.map(entry => ({ 
        value: Number(entry[name]),
        name: entry[entryNameKey],
      })),
      padAngle: 2,
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
          color: (params: { dataIndex: number }) => themeColors[params.dataIndex],
          borderWidth: 0,
          decal: false,
        },
      emphasis: {
        focus: 'self'
      },
      label: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: 'bold',
        formatter: (params: { name: string; value: number }) => {
          // @todo: if not a percentage, show both value and percentage?
          return `${params.name}\n{valueStyle|${formatValue(params.value)}}`;
        },
        rich: {
          valueStyle: {
            fontWeight: 'normal',
          },
        },
      },
    }));
    return series;
  }

  #render() {
    if (!this.#chart || !this.#data) {
      return;
    }

    const isHighContrastMode = $highContrast.get().isEnabled;

    this.#chart.setOption({
      aria: {
        enabled: true,
        decal: {
          show: isHighContrastMode,
        }
      },
      series: this.#dataToSeries(this.#data),
    });
  }
}

customElements.define('pie-chart', PieChartComponent);
