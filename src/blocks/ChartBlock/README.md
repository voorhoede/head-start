# Chart Block

**Graphically display tabular data as a chart (pie/bar/line) with text alternatives (title, description, table, download) and high constrast mode for enhanced accessibility.**

## Features

* Supports pie (donut), bar and line charts with multiple data series.
* Chart data format is based on output of the [DatoCMS Table Editor](https://www.datocms.com/marketplace/plugins/i/datocms-plugin-table-editor).
* Supports value formatting with prefix (like "€"), suffix (like "°C") and number precision.
* Has themes (categorial, sequential) with distinct colours with alternating light and dark tint for enhanced accessibility (based on gov.uk). Allows for extending with own custom themes.
* Offers a high contrast mode which can be turned on manually and defaults to the user's system settings.
* Uses a figure with a figcaption for enhanced accessibility.
* Offers a detailed text description (part of the figcaption) as alternative and addition to the chart for enhanced accessibility.
* Offers the chart source data in a responsive table (part of figcaption) for enhanced accessibility (see [Responsive Table component](../../components/ResponsiveTable/README.md) for detailed features).
* Offers the chart source data as download (part of figcaption) using an accessible download link (see [Download Link component](../../components/DownloadLink/README.md) for detailed features).

### Pie Chart

* Has distinct decal pattern fills with monochrome palette in high contrast mode for enhanced accessibility.
* Has data entry name and value directly next to each piece of the pie to connect this data without the need for a legend (enhanced accessibility).

### Bar Chart

* ...

### Line Chart

* Has distinct symbols for data points and distinct dashed line patterns in high contrast mode for enhanced accessibility.
* Has serie name labels next to the end of each line to connect name and line without the need for a legend (enhanced accessibility).
* Y-axis always starts at zero ...

## Relevant links

* [Accessible charts: a checklist of the basics by gov.uk](https://analysisfunction.civilservice.gov.uk/policy-store/charts-a-checklist/)
* [Checklist for Accessible Data Visualisations by The A11Y Collective](https://www.a11y-collective.com/blog/accessible-charts/)
* [How to make interactive charts accessible by Deque](https://www.deque.com/blog/how-to-make-interactive-charts-accessible/)
* [Complex images (including chart with table in figcaption) by W3C WAI](https://www.w3.org/WAI/tutorials/images/complex/#approach-3-structurally-associating-the-image-and-its-adjacent-long-description-html5)
* [Making Accessible Charts by gov.uk (on YouTube)](https://youtu.be/Ik1Qs6np8_U)
* [ECharts Web Accessibility features](https://echarts.apache.org/handbook/en/best-practices/aria/)
