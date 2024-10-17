# Switch Input

**A [switch](https://w3c.github.io/aria/#switch) functions similar to a checkbox but explicitly represents boolean on and off states.**

## Notes

Based on [web.dev: Building a switch component](https://web.dev/articles/building/a-switch-component).

- Progressively enhances an `input[type="checkbox"]`.
- Accessibility support using native checkbox states (`:checked`, `:indeterminate`), `role="switch"` and `reduced-motion` query.
- Uses custom properties for styling, which you can overwrite when using the component (see [usage](#usage)).

## Usage

The switch input supports the same attributes as a checkbox input as that element is used under the hood.

```astro
---
import SwitchInput from '@components/SwitchInput/SwitchInput.astro';
---

<label for="s1">Switch 1</label>
<SwitchComponent name="s1" id="s1" />

<label for="s2">Switch 2</label>
<SwitchComponent name="s2" id="s2" checked={ true } />

<label for="s3">Switch 3</label>
<SwitchComponent name="s3" id="s3" style="--thumb-size: 2em;" />
```
