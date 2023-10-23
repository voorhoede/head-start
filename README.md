# Head Start

**Base setup on top of headless services to help you quickly start a new website**

## Philosophy

- Provide a generic template to help develop new websites (not web apps) faster.
- Provide a pre-defined setup for composable pages with common components.
- Provide pre-configured services like a CMS and deployment platform.
- Support common needs like internationalisation (i18n), SEO, redirects and analytics.
- Provide functional interactivity without specific styling ("unstyled").
- Provide a fully accessible and highly performant baseline for every project.

## Architecture

The site is created as lightweight progressively enhanced website connected to a headless CMS:

- [Astro](https://astro.build/) - web framework to structure this project.
- [Svelte](https://svelte.dev/) - JS framework used to add interactivity to pages. Svelte is selected for its small footprint (no framework bundle). A [community version of Headless UI in Svelte](https://svelte-headlessui.goss.io/) is used for fully accessible, unstyled and well-tested common components (dialogs, popovers, tabs, etc).
- [DatoCMS](https://www.datocms.com/) - a headless CMS is connected to manage web content. DatoCMS is selected for its modular and structured content options, advanced image service, multi-language support and GraphQL API.
- [Rosetta](https://github.com/lukeed/rosetta) - is an internationalization (i18n) library. Rosetta is selected for its small footprint (<300 bytes) and for being framework agnostic.
- [Cloudflare Pages](https://pages.cloudflare.com/) - is a JAMstack hosting platform. Cloudflare Pages is selected for its reliable CDN, zero cold-start workers, green hosting and affordable pricing.

## 🚀 Project Structure

Inside of this project, you'll see the following folders and files:

```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Default.astro
│   └── pages/[locale]/
│       ├── index.astro
│       └── [slug].astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## Getting started

1. Select "Use this template" > "Create a new repository".
2. Clone the new repository.
3. [Create a DatoCMS instance](https://dashboard.datocms.com/personal-account/projects/browse/new).
4. Copy `.env.example` to `.env` and fill it out.
5. Install the dependenies (`npm install`)
6. You're good to go. Follow any of the [commands](#commands) below.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command (`npm run ...`) | Action                                          
|:------------------------| :-----------------------------------------------
| `dev`                   | Starts local dev server at `localhost:4323` (head in T9)
| `build`                 | Build your production site to `./dist/`
| `preview`               | Preview your build locally, before deploying
| `astro ...`             | Run CLI commands like `astro add`, `astro check`
| `astro -- --help`       | Get help using the Astro CLI
| `lint`                  | Check code style (add `-- --fix` to fix issues)
