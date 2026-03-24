# Project Structure

**Head Start is based on and extends the [Astro project structure](https://docs.astro.build/en/core-concepts/project-structure/).**

Inside of this project, you'll see the following folders and files:

```
/
├── config/
├── docs/
│   └── decision-log/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── icons/
│   │       └── name.svg
│   ├── blocks/
│   │   ├── Blocks.astro
│   │   └── SomeContentBlock/
│   │       ├── SomeContentBlock.astro
│   │       └── SomeContentBlock.fragment.graphql
│   ├── components/
│   │   └── SomeUiComponent.astro
│   ├── layouts/
│   │   └── Default.astro
│   ├── lib/
│   │   └── some-helper-function.ts
│   ├── middleware/
│   │   └── some-req-res-interceptor.ts
│   └── pages/
│       ├── api/
|       |   └── some-dynamic-endpoint.ts
│       └── [locale]/
│           ├── index.astro
│           └── _index.query.graphql
└── package.json
```

- `docs/` contains project documentation.
  - `decision-log/` lists all key decisions made during the project. Please read the log so you understand why decisions are made and document key decisions when you make them.
  - `self-guide.md` is the content editor guide displayed inside the CMS via the [custom page plugin](https://www.datocms.com/marketplace/plugins/i/datocms-plugin-custom-page). Edit this file to update the guide. Images for the guide go in `public/self-guide/` and can be referenced as `![alt](/self-guide/filename.png)`. Preview changes locally at `http://localhost:4323/self-guide/`.
- `src/` contains all website source files that will be handled by Astro.
  - `pages/` - [Pages](https://docs.astro.build/en/core-concepts/astro-pages/) are organised by file system routing and are paired with GraphQL query files for data loading.
  - `pages/api/` - [API routes](https://docs.astro.build/en/core-concepts/endpoints/#server-endpoints-api-routes) are dynamic server endpoints with support for path & query params etc.
  - `components/` - [Components](https://docs.astro.build/en/core-concepts/astro-components/) are the elements the website is composed of. This can be Astro and framework specific components.
  - `blocks/` - Blocks are a specific set of components which have a complementary content [Block](https://www.datocms.com/docs/content-modelling/blocks) in DatoCMS and therefore have a paired GraphQL fragment file.
  - `layouts/` - [Layouts](https://docs.astro.build/en/core-concepts/layouts/) are Astro components used to provide a reusable UI structure, such as a page template.
  - `lib/` - Shared logic and utility helpers, like `datocms`, `i18n` and `routing`.
  - `middleware` - intercept and (possibly) transform requests & responses. See [Astro middleware](https://docs.astro.build/en/guides/middleware/).
  - `assets/` - is for assets that require a build step. See [Assets](./assets.md). 
- `public/` is for any static assets that are served as-is. See [Assets](./assets.md).
- `config/` bundles all our configuration files (like DatoCMS migrations), so the project root doesn't become too cluttered.
- `scripts/` contains all our custom CLI scripts, typically available via `package.json` > `scripts`. Also see [Commands](../README.md#commands).
