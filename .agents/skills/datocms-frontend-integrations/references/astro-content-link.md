# Astro Content Link — `<ContentLink />` for Visual Editing

Astro-specific wiring for `@datocms/astro/ContentLink`. Unlike React, Vue, and Svelte, Astro auto-detects navigation and does not require router props.

## Contents

- Shared Concepts
- Setup
- View Transitions Support
- Enabling Click-to-Edit
- `<ContentLink />` Props
- Data Attributes Reference
- Group & Boundary Resolution Rules
- Structured Text Integration
- Low-Level Utilities
- Troubleshooting

## Shared Concepts

Read [content-link-concepts.md](./content-link-concepts.md) first for the shared model:

- stega encoding and draft-only query changes
- `baseEditingUrl` semantics
- shared data attributes, grouping rules, low-level controller utilities, and common troubleshooting

Use this file for Astro-only component behavior, View Transitions notes, and supported props.

## Setup

```js
import { ContentLink } from '@datocms/astro/ContentLink';
```

**Note:** `@datocms/astro` uses subpath imports — always import from `@datocms/astro/ContentLink`, not from `@datocms/astro`.

First, make sure your shared query layer already enables Content Link for draft requests. See [Query Function Changes](./content-link-concepts.md#query-function-changes).

Then place the component in your layout. It renders nothing visible but activates Visual Editing features:

```astro
---
// src/layouts/Layout.astro
import { ContentLink } from '@datocms/astro/ContentLink';
---

<html>
  <head>
    <!-- your head content -->
  </head>
  <body>
    <slot />
    <ContentLink />
  </body>
</html>
```

Astro handles navigation synchronization automatically, including projects that use View Transitions.

## View Transitions Support

The component automatically handles both scenarios:

- **With View Transitions**: Listens to `astro:page-load` events and syncs the URL with the Web Previews plugin during client-side navigation
- **Without View Transitions**: Initializes correctly and handles navigation via standard page reloads

No additional configuration needed — unlike React/Vue/Svelte, there are no `onNavigateTo` or `currentPath` props to wire up.

## Enabling Click-to-Edit

### Via Prop (Persistent)

```astro
<ContentLink enableClickToEdit={true} />
```

With options:

```astro
<!-- Scroll to nearest editable element if none visible -->
<ContentLink enableClickToEdit={{ scrollToNearestTarget: true }} />

<!-- Only on devices with hover capability (non-touch) -->
<ContentLink enableClickToEdit={{ hoverOnly: true }} />

<!-- Both -->
<ContentLink enableClickToEdit={{ hoverOnly: true, scrollToNearestTarget: true }} />
```

| Option | Type | Default | Description |
| - | - | - | - |
| `scrollToNearestTarget` | boolean | false | Auto-scroll to nearest editable element if none visible |
| `hoverOnly` | boolean | false | Only enable on hover-capable devices; touch users can still toggle with Alt/Option |

### Via Keyboard Shortcut (Temporary)

Hold **Alt** (Windows/Linux) or **Option** (Mac) to temporarily show click-to-edit overlays. Releasing the key hides them.

## `<ContentLink />` Props

| Prop | Type | Default | Description |
| - | - | - | - |
| `enableClickToEdit` | `boolean \| { scrollToNearestTarget?: boolean; hoverOnly?: boolean }` | — | Enable click-to-edit overlays persistently |
| `stripStega` | boolean | `false` | Strip stega-encoded invisible characters from text content |

**Note:** Unlike React/Vue/Svelte which also accept `onNavigateTo`, `currentPath`, and `root` props, Astro's `<ContentLink />` only has 2 props. Navigation is handled automatically.

## Data Attributes Reference

### Developer-Specified Attributes

#### `data-datocms-content-link-url`

Marks an element as editable with an explicit edit URL. Use for **non-text fields** (booleans, numbers, dates, JSON) that cannot contain stega encoding. Use the `_editingUrl` field:

```graphql
query {
  product {
    price
    isActive
    _editingUrl
  }
}
```

```astro
<span data-datocms-content-link-url={product._editingUrl}>
  ${product.price}
</span>
```

#### `data-datocms-content-link-source`

Attaches stega metadata without rendering it as content. For elements that can't contain text (`<video>`, `<audio>`, `<iframe>`, etc.):

```astro
<div data-datocms-content-link-source={video.alt}>
  <video src={video.url} poster={video.posterImage.url} controls></video>
</div>
```

The value must be a stega-encoded string (any text field from the API works).

#### `data-datocms-content-link-group`

Expands the clickable area to a parent element. By default, only the immediate parent of stega text is clickable. This makes a larger ancestor clickable instead:

```astro
<article data-datocms-content-link-group>
  <h2>{product.title}</h2>
  <p>${product.price}</p>
</article>
```

Clicking anywhere in `<article>` opens the editor.

**Important:** A group should contain only one stega-encoded source. Multiple sources in the same group cause a collision warning (last URL wins).

#### `data-datocms-content-link-boundary`

Stops the upward DOM traversal for group resolution. Creates an independent editable region:

```astro
<div data-datocms-content-link-group>
  <h1>{page.title}</h1>
  <section data-datocms-content-link-boundary>
    <span>{page.author}</span>
  </section>
</div>
```

Without the boundary, clicking `page.author` would open the outer group's URL.

### Library-Managed Attributes (Automatic)

| Attribute | Description |
| - | - |
| `data-datocms-contains-stega` | Added to elements with stega content (only when `stripStega` is false) |
| `data-datocms-auto-content-link-url` | Added to elements identified as editable targets; contains the resolved edit URL |

## Group & Boundary Resolution Rules

When stega content is found, the library walks up the DOM from that element:

1. **Finds `data-datocms-content-link-group`** — stamps that element as clickable target
2. **Finds `data-datocms-content-link-boundary`** — stops traversal, stamps the starting element as clickable target
3. **Reaches root without finding either** — stamps the starting element

## Structured Text Integration

Structured Text fields need special handling:

**Rule 1:** Always wrap `<StructuredText>` in a group:

```astro
<div data-datocms-content-link-group>
  <StructuredText data={page.content} />
</div>
```

**Rule 2:** Add boundary on block, inline block, and inline record components — but **NOT** on link-to-record components:

```astro
---
// src/components/Cta.astro
const { block } = Astro.props;
---

<div data-datocms-content-link-boundary>
  <a href={block.url}>{block.label}</a>
</div>
```

For inline blocks, use `<span>`:

```astro
---
// src/components/NewsletterSignup.astro
const { block } = Astro.props;
---

<span data-datocms-content-link-boundary>
  <input type="email" placeholder={block.placeholder} />
</span>
```

Same for inline records:

```astro
---
// src/components/InlineTeamMember.astro
const { record } = Astro.props;
---

<span data-datocms-content-link-boundary>
  <a href={`/team/${record.slug}`}>{record.name}</a>
</span>
```

Full example:

```astro
---
import { StructuredText } from '@datocms/astro/StructuredText';
import Cta from '~/components/Cta.astro';
import NewsletterSignup from '~/components/NewsletterSignup.astro';
import InlineTeamMember from '~/components/InlineTeamMember.astro';
---

<div data-datocms-content-link-group>
  <StructuredText
    data={page.content}
    blockComponents={{
      CtaRecord: Cta,
    }}
    inlineBlockComponents={{
      NewsletterSignupRecord: NewsletterSignup,
    }}
    inlineRecordComponents={{
      TeamMemberRecord: InlineTeamMember,
    }}
  />
</div>
```

**Why link-to-record components don't need a boundary:** Record links are `<a>` tags wrapping text that belongs to the surrounding structured text — no separate editing target, no collision.

## Low-Level Utilities

### `stripStega`

Removes stega encoding from any data type:

```js
import { stripStega } from '@datocms/astro/ContentLink';

stripStega("Hello world")           // clean string
stripStega({ name: "John", age: 30 }) // clean object
stripStega(["First", "Second"])      // clean array
```

### `decodeStega`

Extracts editing metadata from stega-encoded content:

```js
import { decodeStega } from '@datocms/astro/ContentLink';

const metadata = decodeStega(text);
// Returns: { origin: string, href: string } | null
```

### `revealStega` (debugging)

Replaces each invisible stega segment with a visible `[STEGA:/editor/...]` marker. Preserves the input shape — strings stay strings, objects/arrays keep their structure. Use this whenever a stega-related bug is suspected, since `console.log` alone shows nothing (the encoding is zero-width Unicode):

```js
import { revealStega } from '@datocms/astro/ContentLink';

console.log(revealStega(page.title));        // "Hello[STEGA:/editor/...]"
console.log(revealStega(graphqlResponse));   // same object shape, markers visible inside strings
```

**Use cases:**

- **Meta tags and social sharing**: Use `stripStega()` to clean text before adding to `<meta>` tags
- **Programmatic text processing**: Remove invisible characters before string operations, comparisons, splits, slug/URL generation, analytics, or any non-render use
- **Debugging**: Use `revealStega()` to see which fields in a GraphQL response carry stega; use `decodeStega()` to inspect a specific editing URL

See [content-link-concepts.md → When to Strip Stega](./content-link-concepts.md#when-to-strip-stega) for the full rule. Note: DatoCMS `slug` field types are never stega-encoded and don't need stripping.

## Troubleshooting

### Click-to-edit overlays not appearing

1. Verify `contentLink: 'v1'` and `baseEditingUrl` are set in API calls
2. Check that `<ContentLink />` is mounted in your layout
3. Enable click-to-edit: `<ContentLink enableClickToEdit={true} />` or hold Alt/Option
4. Check browser console for errors
5. Ensure you're viewing draft content (Content Link metadata is only included for draft content)

### Navigation not syncing in Web Previews plugin

1. Verify you're running inside the plugin's iframe
2. Ensure `<ContentLink />` is in a layout that persists across page navigations
3. Check browser console for iframe communication errors

### StructuredText blocks not clickable

1. Wrap with `data-datocms-content-link-group`
2. Add `data-datocms-content-link-boundary` to block, inline block, and inline record components

### Layout issues from stega encoding

1. Use `stripStega` prop: `<ContentLink stripStega={true} />`
2. Or CSS fix: `[data-datocms-contains-stega] { letter-spacing: 0 !important; }`
