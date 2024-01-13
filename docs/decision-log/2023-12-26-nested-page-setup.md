# Nested pages setup

**Enable nested pages using a Parent Page field on Page models.**

- Date: 2023-12-26
- Alternatives Considered: [DatoCMS tree-like collections](https://www.datocms.com/docs/content-modelling/trees); allow slashes in Slug field; Breadcrumbs field to link multiple pages.
- Decision Made By: [Jasper](https://github.com/jbmoelker), [Declan](https://github.com/decrek)

## Decision

Website visitors and marketers (may) want meaningful URLs with nesting. Therefore Head Start should support that a page can be organised as a sub page of another page, so that the URLs can be `/main-page/sub-page/sub-sub-page/`.

There are multiple options to achieve this:

- **Use Parent Page field** on content models. The main advantage of this option is that this allows nesting of different types of page models. For instance a generic Page could be nested in a (future) Product Page. Another advantage is that the Parent Page field can be optional, so not all pages have to be nested.
- [**DatoCMS tree-like collections**](https://www.datocms.com/docs/content-modelling/trees) is built-in functionality. It offers an intuitive UI to create page trees using drag and drop. The downsides are that all pages have to be the same model (Page only), always have to be nested, and it's hard to keep an overview on large content collections.
- **Allow slashes in Slug field** on content models. The main advantage is that this offers a lot of flexibility in defining nested slugs, as editors can enter any `type-of/slug-path/they-want`. The downsides are that it's error-prone for editors, non-existing (parent) pages can end up in the URL, and getting titles and URLs of parent pages for breadcrumbs requires a second query (after splitting out `type-of`, `slug-path` from the slashed page slug).
- **Use Breadcrumb field** on content models. This is similar to the Parent Page field option. The main advantage is that it simplifies querying: `breadcrumbs { _allSlugLocales: { locale, value } }` vs `parentPage { _allSlugLocales: { locale, value, parentPage { _allSlugLocales: { locale, value, etc } } } }`. The downside is that changing a parent page in one page (especially higher up the tree) requires an editor to make those changes on multiple records, which can be error-prone.

With these options considered we've decided the **Parent Page field** is the best option, because:

- Parent Page field allows for creating trees of different models.
- Parent Page field allows better UX experience (filter/search lists vs tree view only).
- Parent Page field allows for an optional parent page.
