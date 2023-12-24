# Tabs Component

**Render content as a tabbed interface, where tabs control which panel is visible.**

## Notes

- Based on [web.dev HowTo Components: howto-tabs](https://web.dev/articles/components-howto-tabs).
- Progressively enhanced. If JavaScript is disabled, all panels are shown interleaved with the respective tabs. The tabs now function as headings.
- Accessibility is enhanced with roles and aria attributes and keyboard support when the component is enhanced.

## Usage

```astro
---
import { Tabs, TabsTab, TabsPanel } from '@components/Tabs';
---

<Tabs>
  <TabsTab>Heading A</TabsTab>
  <TabsPanel>Body A</TabsPanel>
  <TabsTab>Heading B</TabsTab>
  <TabsPanel>Body B</TabsPanel>
  <TabsTab>Heading C</TabsTab>
  <TabsPanel>Body C</TabsPanel>
</Tabs>
```
