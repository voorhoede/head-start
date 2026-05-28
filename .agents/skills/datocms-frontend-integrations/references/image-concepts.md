# Image Rendering Concepts

Shared concepts for DatoCMS responsive image components across all frameworks. For framework-specific component APIs and props, see the dedicated framework reference.

## GraphQL Query

```graphql
query {
  blogPost {
    cover {
      responsiveImage(
        imgixParams: { fit: crop, w: 300, h: 300, auto: format }
      ) {
        src
        width
        height
        alt
        title
        base64    # blur-up placeholder (OR use bgColor, not both)
      }
    }
  }
}
```

## ResponsiveImage Object Fields

| Field | Type | Required | Description |
| - | - | - | - |
| `src` | string | Yes | The `src` attribute for the image |
| `width` | integer | Yes | The width of the image |
| `height` | integer | Yes | The height of the image |
| `alt` | string | No | Alternate text (strongly suggested) |
| `title` | string | No | Title attribute (strongly suggested) |
| `sizes` | string | No | HTML5 `sizes` attribute (omit if passing `sizes` prop to component) |
| `base64` | string | No | Base64-encoded thumbnail for blur-up placeholder |
| `bgColor` | string | No | Background color placeholder (omit if requesting `base64`) |
| `srcSet` | string | No | HTML5 `srcSet` (can be omitted — components auto-generate from `src`) |

## Best Practices

1. **Always use `{ auto: format }`** in `imgixParams` — serves WebP/AVIF automatically without increasing response size
2. **Prefer omitting `srcSet`** from GraphQL — components auto-generate it from `src` + `srcSetCandidates`, dramatically reducing response size when many images are returned
3. **Never request both `bgColor` and `base64`** — `base64` takes precedence, so requesting both only increases response size
4. **Omit `sizes` from GraphQL** if you pass `sizes` as a prop to the component

## Layout Modes

Components that support layout modes (React `<Image />`, Vue `<datocms-image>`) offer:

| Mode | Behavior |
| - | - |
| `intrinsic` (default) | Scales down for smaller viewports, maintains original dimensions for larger viewports |
| `fixed` | Dimensions never change (no responsiveness), like native `<img>` |
| `responsive` | Scales both down and up with viewport |
| `fill` | Stretches to fill parent element (parent must have `position: relative`) |

Lightweight variants (React `<SRCImage />`, Vue `<datocms-naked-image>`, Svelte `<NakedImage>`, Astro `<DatocmsImage>`) render a single `<picture>` element with native lazy loading and do not support layout modes.
