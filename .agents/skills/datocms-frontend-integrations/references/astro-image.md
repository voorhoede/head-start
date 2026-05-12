# Astro Image Component — `<Image />`

Astro component for progressive/responsive images from DatoCMS, designed to work with the `responsiveImage` GraphQL query. Unlike React (which offers `<SRCImage />` and `<Image />`) and Svelte (which offers `<NakedImage />` and `<Image />`), `@datocms/astro` provides a **single `<Image />`** component that is completely native with zero JavaScript footprint.

See `image-concepts.md` for the shared GraphQL query, ResponsiveImage fields, and best practices.

## Setup

```js
import { Image } from '@datocms/astro/Image';
```

**Note:** `@datocms/astro` uses subpath imports — always import from `@datocms/astro/Image`, not from `@datocms/astro`.

## Out-of-the-Box Features

- Completely native, with no JavaScript footprint
- Offers optimized version of images for browsers that support WebP/AVIF format
- Generates multiple smaller images so smartphones and tablets don't download desktop-sized images
- Efficiently lazy loads images to speed initial page load and save bandwidth
- Holds the image position so your page doesn't jump while images load
- Uses either blur-up or background color techniques to show a preview of the image while it loads

## GraphQL Query

See `image-concepts.md` for the full query, field definitions, and best practices.

## Basic Usage

```astro
---
import { Image } from '@datocms/astro/Image';
import { executeQuery } from '@datocms/cda-client';

const query = `
  query {
    blogPost {
      title
      cover {
        responsiveImage(imgixParams: { fit: crop, w: 300, h: 300, auto: format }) {
          src
          width
          height
          alt
          title
          base64
          sizes
        }
      }
    }
  }
`;

const { blogPost } = await executeQuery(query, { token: '<YOUR-API-TOKEN>' });
---

<h1>{blogPost.title}</h1>
<Image data={blogPost.cover.responsiveImage} />
```

## `<Image />` Props

| Prop | Type | Default | Description |
| - | - | - | - |
| `data` | `ResponsiveImage` | **(required)** | Response from `responsiveImage` GraphQL query |
| `pictureClass` | string | null | Additional CSS class for root `<picture>` tag |
| `pictureStyle` | CSS properties | null | Additional CSS for root `<picture>` tag |
| `imgClass` | string | null | Additional CSS class for the `<img>` tag |
| `imgStyle` | CSS properties | null | Additional CSS for the `<img>` tag |
| `priority` | boolean | false | Disables lazy loading, sets `fetchPriority="high"` |
| `sizes` | string | undefined | HTML5 `sizes` attribute (falls back to `data.sizes`) |
| `usePlaceholder` | boolean | true | Whether to show blurred image placeholder |
| `srcSetCandidates` | Array<number> | `[0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4]` | Width multipliers for auto-generated `srcset` (used when `data` has no `srcSet`) |
| `referrerPolicy` | string | `no-referrer-when-downgrade` | Defines which referrer is sent when fetching the image |

## Key Differences from React and Svelte

| Feature | React | Svelte | Astro |
| - | - | - | - |
| Components | `<SRCImage />` (zero JS) + `<Image />` (crossfade) | `<NakedImage />` (minimal JS) + `<Image />` (crossfade) | Single `<Image />` (zero JS) |
| Import | `from 'react-datocms'` | `from '@datocms/svelte'` | `from '@datocms/astro/Image'` |
| Layout modes | `intrinsic`, `fixed`, `responsive`, `fill` | `intrinsic`, `fixed`, `responsive`, `fill` | Not applicable (native `<picture>`) |
| Crossfade | `<Image />` only | `<Image />` only | Not available |
| IntersectionObserver | `<Image />` only | `<Image />` only | Not used (native lazy loading) |

Since Astro's `<Image />` produces a completely native `<picture>` element with no JavaScript, it doesn't support layout modes, crossfade effects, or IntersectionObserver-based lazy loading. It uses the browser's native `loading="lazy"` instead.
