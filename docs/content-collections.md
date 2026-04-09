# Astro Content Collections

Astro's Content Collections allows you to prepare a dataset on build time to query it later in your templates. This means it can also act als a caching layer. View the [Astro documentation](https://docs.astro.build/en/guides/content-collections/) for more information.

Like Astro Content Collections `src/content/config.ts` is used to define the collections. And like Astro, Head Start uses the `getCollection()` and `getEntry()` functions to retrieve data from these collections, but you should use the `~/lib/content` module instead of `astro:content`.

## Differences from Astro's Content Collections
Head Start's Content Collections are similar to Astro's, but with some differences:
* `getEntry` returns live data in development and preview environments.
* `getCollection` and `getEntry` support localized data. Any lookup will first try to search by the current locale, but you can also pass a `locale` parameter to specify a different locale.
