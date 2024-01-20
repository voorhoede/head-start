# Internal Link

**Resolves URL for different page records from the CMS (like the home page or a generic page).**

## Usage

### Adding a page model

When adding a new type of pages model to the CMS, you need to:

- Add it as a reference to the Internal Link model's `page` field in the CMS.
- Add it to the [Internal Link fragment](./InternalLink.fragment.graphql).
- Add it to the [Internal Links's `getHref` method](./InternalLink.astro).
