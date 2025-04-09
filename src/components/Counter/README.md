# Counter

**Counter animates from zero to the provided value, with localisation and enhanced accessibility.**

## Notes

* Counter is rendered as `tabular-nums` so all numbers are same width and align nicely during animation.
* Counter uses number formatting in active `locale` with correct decimal and grouping separators.
* Static value is used as a placeholder in case enhancement doesn't work.
* When enhanced, the placeholder is visually hidden to reserve space and prevent reflow during count up animation.
* When enhanced, the placeholder is made unselectable (to prevent double text selection) and `aria-hidden` is added, for accessibility.
