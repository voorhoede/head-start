# Accessibility (a11y)

**Head Start aims to provide an accessible baseline, by providing helper classes and components.**

## CSS helper classes

Head Start provides CSS helper classes for improved accessibility:

```astro
---
import '@assets/a11y.css';
---

<span class="a11y-sr-only">
  This element is visually hidden, while its content is still 
  accessible by assistive technology like screen readers (sr).
</span>

<a href="..." class="a11y-kb-only">
  This element is visually hidden, and appears 
  only when element has keyboard (kb) focus.
</a>
```

## Skip Link component

Head Start provides a [Skip Link component](../src/components/SkipLink/README.md) that enables keyboard users and users of assistive technology to jump over parts of the UI that are repeated. It's pre-configured in the [Default template](../src/layouts/Default.astro).

## Best practices

Head Start aims to stay close to the web standards. Here's a few tips to help keep it accessible:

- Use semantic HTML as a baseline.
- Use native elements for interaction like `<form>`s, `<label>`led `<input>`s, `<output>`s, `<dialog>`, `<details>` with `<summary>` and native API's like the [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API).
- Add relevant ARIA roles and attributes on custom interactive components.
- Require `alt` texts on assets in the CMS and use their value in templates.
- Test manually using only your keyboard and a screen reader like VoiceOver.
- Test regularly with tools like [Google Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/) and [WebAIM WAVE](https://wave.webaim.org/).
- When adding automated tests, consider [Cypress Axe](https://www.npmjs.com/package/cypress-axe#cychecka11y) or [Playwright Axe](https://playwright.dev/docs/accessibility-testing).
