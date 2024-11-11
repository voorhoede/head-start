# Link to File

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
