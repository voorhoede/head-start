import type { ChartBlockFragment } from '@lib/datocms/types';
import { getLocale } from '@lib/i18n';

export type DataEntry = {
  [key: string]: string
}

export type Data = {
  columns: string[],
  data: DataEntry[]
}

export type ChartBlock = Omit<ChartBlockFragment, 'data' | 'theme'> & {
  data: Data,
  theme: ThemeName,
}

export const valueFormatter = ({ prefix = null, suffix = null, precision = null }: {
  prefix: string | null,
  suffix: string | null,
  precision: number | null,
}) => {
  return (value: number): string => {
    const locale = getLocale();
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: precision ?? 0,
      maximumFractionDigits: precision ?? 0,
    });
    let formattedValue = formatter.format(value);
    if (prefix) {
      formattedValue = `${prefix}${formattedValue}`;
    }
    if (suffix) {
      if (suffix === '%') {
        formattedValue = `${formattedValue}${suffix}`;
      } else {
        formattedValue = `${formattedValue} ${suffix}`;
      }
    }
    return formattedValue;
  };
};

/**
 * Categorical colours must be distinct and with at least 3:1 contrast ratio between adjacent colours.
 * Based on Making Charts Accessible by Government Analysis Function (gov.uk): https://youtu.be/Ik1Qs6np8_U?t=833
 */
export const getCategoricalColors = (numberOfColors: number): string[] => {
  const categoricalThemeColors = [
    '#12436D',
    '#28A197',
    '#801650',
    '#F46A25',
    '#454545',
    '#AC97D9',
  ]; // @todo: extend palette to at least 12 colors?
  return Array(numberOfColors).fill(null).map((_, index) => {
    const isLastItem = index === numberOfColors - 1;
    const isFirstThemeColor = index % categoricalThemeColors.length === 0;
  
    if (isLastItem && isFirstThemeColor) {
      // Avoid same color for last and first item as they may be adjacent in a chart.
      return categoricalThemeColors[1];
    }

    return categoricalThemeColors[index % categoricalThemeColors.length];
  });
};

/**
 * Sequential colours range from dark blue (#12436D) to light blue (#6BACE6).
 * Based on Making Charts Accessible by Government Analysis Function (gov.uk): https://youtu.be/Ik1Qs6np8_U?t=833
 */
export const getSequentialColors = (numberOfColors: number): string[] => {
  if (numberOfColors <= 0) return [];

  const start = { r: 18, g: 67, b: 109 };
  const end = { r: 107, g: 172, b: 230 };

  const rgbToHex = (r: number, g: number, b: number) =>
    '#' + [r, g, b]
      .map(value => {
        const clamped = Math.round(Math.max(0, Math.min(255, value)));
        return clamped.toString(16).padStart(2, '0');
      })
      .join('')
      .toUpperCase();

  if (numberOfColors === 1) return [rgbToHex(start.r, start.g, start.b)];

  return Array(numberOfColors).fill(null).map((_, index) => {
    const t = index / (numberOfColors - 1); // Percentage (0.0 to 1.0)
    const r = start.r + (end.r - start.r) * t;
    const g = start.g + (end.g - start.g) * t;
    const b = start.b + (end.b - start.b) * t;
    return rgbToHex(r, g, b);
  });
};

export const themeNames = ['categorical', 'sequential'] as const;
export type ThemeName = typeof themeNames[number];

export const getThemeColors = (theme: ThemeName | null, numberOfColors: number): string[] => {
  if (theme === 'categorical') {
    return getCategoricalColors(numberOfColors);
  }
  if (theme === 'sequential') {
    return getSequentialColors(numberOfColors);
  }
  // extend with custom themes as needed
  return [];
};
