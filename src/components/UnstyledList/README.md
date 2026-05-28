# Unstyled List

~~**Restores semantic list role on an unstyled list.**~~

~~Lists require `[role="list"]` attribute when `list-style: none;` is applied to maintain accessibility in VoiceOver in Safari. See [explanation on web.dev](https://web.dev/articles/website-navigation#:~:text=The%20WebKit%20team%20decided%20to%20remove%20list%20semantics%2C%20when%20a%20list%20doesn%27t%20look%20like%20a%20list.).~~

When using the `list-style-type: "";` CSS property with an empty string value, you remove the visual list markers (bullets, numbers, etc.) while preserving the semantic meaning and accessibility properties of the list for screen readers and other assistive technologies.
