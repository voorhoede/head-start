# Render to Markdown

**Use `Astro.slots.render` to transform HTML content to Markdown both during build- and run-time.**

- Date: 2024-12-27
- Alternatives Considered: `AstroContainer.renderToString`, to Markdown per block, post build script to transform HTML to Markdown.
- Decision Made By: [Jasper](https://github.com/jbmoelker)

## Decision

Making our HTML pages available as Markdown is of interest to some people and especially suitable for software such as LLM's. Using `Astro.slots.render` seems to be the only solution that works both during build- and run-time.

### Solution

A componanion `.md.astro` route with a `ToMarkdown` component that leverages `Astro.slots.render` to get a usable HTML string, which can be used to transform to Markdown (and other formats):

```astro
---
const html = Astro.slots.render('default');
const md = /* transform html to md any way you want */
---
<Fragment set:text={md} />
```

### Alternatives considerd

These alternatives were explored and rejected:

- Using `AstroContainer.renderToString` in a `.ts` route rather than a `.astro` route would give direct access to the HTML string. However this method currently relies on `node:path` which is not available in the Cloudflare runtime.
- Using alternative render methods in each block that return a Markdown instead of an HTML output. This requires extra work for every existing and new component and is hard to keep in sync. This option is rejected because of the extra complexity.
- Using a post build script with the same transformers used in the `ToMarkdown` component or other libraries relying on the Node.js runtime. This works only for pages statically generated during build. It's unsuitable for dynamically rendered pages and is therefore rejected.
