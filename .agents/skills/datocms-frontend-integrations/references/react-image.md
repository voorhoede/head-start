# React Image Components — `<SRCImage />` and `<Image />`

React components for progressive/responsive images from DatoCMS, designed to work with the `responsiveImage` GraphQL query.

See `image-concepts.md` for the shared GraphQL query, ResponsiveImage fields, best practices, and layout modes.

## Contents

- `<SRCImage />` vs `<Image />`
- GraphQL Query
- Basic Usage
- `<SRCImage />` Props
- `<Image />` Props
- Layout Modes (`<Image />` only)
- Handling Dynamic `data` Changes

## `<SRCImage />` vs `<Image />`

| | `<SRCImage />` | `<Image />` |
| - | - | - |
| Component type | React Server Component | Client Component |
| JS footprint | None (zero JS) | Has JS bundle |
| HTML output | Single `<picture>` element | Multiple wrapper elements around `<picture>` |
| Lazy loading | Native `loading="lazy"` | `IntersectionObserver` (customizable thresholds) |
| Placeholder fade | No crossfade (placeholder is background of image) | Crossfade effect between placeholder and image |
| Transparency | Not recommended if image has alpha channel (placeholder stays behind) | Safe for transparent images |

**When to use which:**

- Use `<SRCImage />` by default — zero JS, simpler output, works as RSC
- Use `<Image />` when you need crossfade effects, custom lazy-loading thresholds, or images with transparency

## GraphQL Query

See `image-concepts.md` for the full query, field definitions, and best practices.

## Basic Usage

```jsx
import { Image, SRCImage } from 'react-datocms';

function BlogPost({ data }) {
  return (
    <div>
      <h1>{data.blogPost.title}</h1>

      {/* Server Component — native lazy loading, zero JS */}
      <SRCImage data={data.blogPost.cover.responsiveImage} />

      {/* Client Component — IntersectionObserver, crossfade */}
      <Image data={data.blogPost.cover.responsiveImage} />
    </div>
  );
}
```

## `<SRCImage />` Props

| Prop | Type | Default | Description |
| - | - | - | - |
| `data` | `ResponsiveImage` | **(required)** | Response from `responsiveImage` GraphQL query |
| `pictureClassName` | string | null | Additional className for root `<picture>` tag |
| `pictureStyle` | CSS properties | null | Additional CSS for root `<picture>` tag |
| `imgClassName` | string | null | Additional className for `<img>` tag |
| `imgStyle` | CSS properties | null | Additional CSS for `<img>` tag |
| `priority` | boolean | false | Disables lazy loading, sets `fetchPriority="high"` |
| `sizes` | string | undefined | HTML5 `sizes` attribute (falls back to `data.sizes`) |
| `usePlaceholder` | boolean | true | Whether to show blurred image placeholder |
| `srcSetCandidates` | Array<number> | `[0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4]` | Width multipliers for auto-generated `srcset` (used when `data` has no `srcSet`) |

## `<Image />` Props

| Prop | Type | Default | Description |
| - | - | - | - |
| `data` | `ResponsiveImage` | **(required)** | Response from `responsiveImage` GraphQL query |
| `layout` | `'intrinsic' \| 'fixed' \| 'responsive' \| 'fill'` | `"intrinsic"` | Layout behavior as viewport changes size |
| `fadeInDuration` | integer | 500 | Duration (ms) of fade-in transition on load |
| `intersectionThreshold` | float | 0 | Visibility percentage to trigger loading (0 = one pixel visible, 1 = fully visible) |
| `intersectionMargin` | string | `"0px 0px 0px 0px"` | Margin around placeholder for intersection calculation |
| `priority` | boolean | false | Disables lazy loading, sets `fetchPriority="high"` |
| `sizes` | string | undefined | HTML5 `sizes` attribute (falls back to `data.sizes`) |
| `onLoad` | `() => void` | undefined | Callback when image finishes loading |
| `usePlaceholder` | boolean | true | Whether to show blurred image placeholder |
| `srcSetCandidates` | Array<number> | `[0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4]` | Width multipliers for auto-generated `srcset` |
| `className` | string | null | Additional CSS className for root node |
| `style` | CSS properties | null | Additional CSS for root node |
| `pictureClassName` | string | null | Additional CSS class for inner `<picture>` tag |
| `pictureStyle` | CSS properties | null | Additional CSS for inner `<picture>` tag |
| `imgClassName` | string | null | Additional CSS class for image inside `<picture>` |
| `imgStyle` | CSS properties | null | Additional CSS for image inside `<picture>` |
| `placeholderClassName` | string | null | Additional CSS class for placeholder image |
| `placeholderStyle` | CSS properties | null | Additional CSS for placeholder image |

## Layout Modes (`<Image />` only)

See `image-concepts.md` for the layout mode table. Use the `layout` prop on `<Image />` to select a mode.

### Fill Layout Example

```jsx
<div style={{ position: 'relative', width: 200, height: 500 }}>
  <Image
    data={imageData}
    layout="fill"
    objectFit="cover"
    objectPosition="50% 50%"
  />
</div>
```

## Handling Dynamic `data` Changes

When the `data` prop changes, the component behaves like a regular `<img>` — the old image stays visible until the new one loads. To force an immediate swap (old image disappears while new one loads), use a `key` prop:

```jsx
<Image
  key={imageData.src}
  data={imageData}
/>
```
