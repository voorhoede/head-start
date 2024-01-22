# Embed Block

**Renders external content based on the block's OEmbed data.**

## Features

- Supports [~300 content providers](https://oembed.com/providers.json) (like Twitter, Flickr, YouTube, etc) using the [OEmbed](https://oembed.com/) protocol.
- Renders a noscript embed version which is dynamically enhanced.
- Lazy loads embed scripts and iframes to improve performance.
- Provides a mechanism to define custom renderer per provider.
- If OEmbed data is unavailable, a link is displayed with the page title of the given URL.

## Relevant links

- Embed Block data is preloaded in the CMS using the [DatoCMS OEmbed Plugin](https://github.com/voorhoede/datocms-plugin-oembed/).

