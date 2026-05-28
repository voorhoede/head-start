export const getItemPopoverId = (baseId: string, suffix?: string) => {
  return `popover-${baseId}${suffix ? `-${suffix}` : ''}`;
};
