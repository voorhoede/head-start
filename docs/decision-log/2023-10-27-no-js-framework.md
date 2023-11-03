# No JS Framework

**We've decided to only use Astro components and minimal vanilla JS and not bind Head Start to a specific JS framework.**

- Date: 2023-10-27
- Alternatives Considered: Preact (3kb React replacement, JSX templating similar to Astro), Svelte (lightweight output, no framework runtime)
- Decision Made By: [Jasper](https://github.com/jbmoelker), [Declan](https://github.com/decrek), [Sjoerd](https://github.com/sjoerdbeentjes)

## Decision

Aim of Head Start is to provide a generic template for different websites. This means we want project authors that use Head Start to decide if and which JS framework flavour (React, Vue, Svelte). As such we've decided to only use Astro components and minimal vanilla JS and not bind Head Start to a specific JS framework.

We've considered Preact and Svelte as lightweight JS frameworks. But have decided it's better to leave that choice to project authors.
