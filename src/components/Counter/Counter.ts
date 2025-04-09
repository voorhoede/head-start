export const getFractionDigits = (value: number) => {
  return String(value).split('.')[1]?.length ?? 0;
};

export const formatNumber = (value: number, locale: string) => {
  const fractionDigits = getFractionDigits(value);
  const formatter = new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return formatter.format(value);
};

export const getSeparators = (locale: string) => {
  const parts = new Intl.NumberFormat(locale, { useGrouping: true })
    .formatToParts(1000.1);
  const groupPart = parts.find(part => part.type === 'group');
  const decimalPart = parts.find(part => part.type === 'decimal');
  return { 
    groupSeparator: groupPart ? groupPart.value : undefined, 
    decimalSeparator: decimalPart ? decimalPart.value : undefined,
  };
};
