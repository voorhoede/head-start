# File

**The file model provides a generic pattern for content editors to add and reference files.**

## Features

- Editors can upload an asset and link to the file records in text and other fields.
- Editors can select the locale of a file for improved accessibility.
- Editors can define a custom URL slug, so files can be under specific URLs. These might be needed due to a migration of a former website or because other software may expect specific URLs.

---

# File Link

**Download link for a file, with accessible meta data (language, format and size).**

## Features

- Triggers a file download forced by the `a[download]` attribute. It uses the file's original name (or the one from the customised file `slug` field) rather than the auto-generated URL from DatoCMS. This feature relies on [file proxy redirects](../../../docs/routing.md#file-redirects), as the [`download` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download) only works on same-domain URLs.
- Shows language of the file contents (when different from the current page language) for better accessibility. Displayed in brackets as link suffix. Example: `(French)` on an English page.
- Shows the file format so users understand the link doesn't navigate to another page, but rather downloads a file. This improves accessibility and over user experience. Example `(PDF)`.
- Shows the file size in human readable. This allows users to avoid unnecessary downloads, which is also eco-responsible (green) best practice. Example: `(2.5 MB)`.
- Has icon to visually distinguish downloads. Can easily be removed or replaced with another (format specific) icon.
- Adds locale (`a[hreflang]`) and mime type (`a[type]`) for assistive technology and other applications. Example: `<a href="..." hreflang="fr" type="application/pdf">`.

## Relevant links

- [Orange.com: a11y guidelines for download links](https://a11y-guidelines.orange.com/en/articles/download-links/)
- [Accessibilly.com: Proposal for a more accessible Download Link
](https://accessabilly.com/proposal-for-a-more-accessible-download-link/)
