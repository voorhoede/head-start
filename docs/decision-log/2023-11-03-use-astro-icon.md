# Use `astro-icon` package

**Use the [`astro-icon`](https://github.com/natemoo-re/astro-icon) package for our icon setup.**

- Date: 2023-11-03
- Alternatives Considered: use `svg-sprite` package to roll your own icon setup.
- Decision Made By: [Jasper](https://github.com/jbmoelker)

## Decision

Why we favour `astro-icon` over `svg-sprite`

- Both use an SVG sprite with SVGO, but `astro-icon` also automatically only includes icons used in the sprite.
- `astro-icon` includes a watcher with hot reload support.
- `astro-icon` is created and maintained by Astro core member Nate Moore.
