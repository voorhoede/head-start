# Locale Selector

**Lists pages in alternate languages to navigate to.**

## Notes

* Component is a navigation element with a list of links `nav > ul > li > a`.
* Navigation elements are advised to have [a heading `<h?>` and/or `[aria-labelledby]` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements#labeling_section_content) for accessibility.
* Links use language codes (`<abbr>`) with [full name in their given language for accessibility](https://uxdesign.cc/designing-language-selectors-that-work-well-with-assistive-technology-c645a16e73e7). Each `<a>` tag therefore has an `[aria-label]` and a `[lang]` attribute. For example: `<a lang="nl" aria-label="Nederlands" ...>`.
* Links to pages in alternate languages are advised to have an [`[hreflang]` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-hreflang).
* Link for current page is advised to have an [`[aria-current="page"]` attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current) for accessibility.
* Lists require `[role="list"]` attribute when `list-style: none;` is applied to maintain accessibility in VoiceOver in Safari.

## Relevant links

* [web.dev: Building the main navigation for a website](https://web.dev/website-navigation/)
