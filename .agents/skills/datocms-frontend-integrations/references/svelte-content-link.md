# Svelte Content Link — `<ContentLink />` for Visual Editing

Svelte-specific wiring for `@datocms/svelte` Content Link in Svelte and SvelteKit projects.

## Contents

- Shared Concepts
- Setup
- SvelteKit Integration
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

Use this file for Svelte-only component API, router wiring, and Structured Text integration details.

## Setup

First, make sure your shared query layer already enables Content Link for draft requests. See [Query Function Changes](./content-link-concepts.md#query-function-changes).

Then mount the Svelte component in a root layout (it renders no visible UI):

```svelte
<script>
  import { ContentLink } from '@datocms/svelte';
</script>

<ContentLink />

<!-- Your content here -->
```

## SvelteKit Integration

For full [Web Previews plugin](https://www.datocms.com/marketplace/plugins/i/datocms-plugin-web-previews) integration, provide `onNavigateTo` and `currentPath` to sync preview navigation with the CMS:

```svelte
<script>
  import { ContentLink } from '@datocms/svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
</script>

<ContentLink
  onNavigateTo={(path) => goto(path)}
  currentPath={page.url.pathname}
/>
```

Place this in your root `+layout.svelte`:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { ContentLink } from '@datocms/svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
</script>

<ContentLink
  onNavigateTo={(path) => goto(path)}
  currentPath={page.url.pathname}
/>

<slot />
```

## Enabling Click-to-Edit

### Via Prop (Persistent)

```svelte
<ContentLink enableClickToEdit={true} />
```

With options:

```svelte
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
| `onNavigateTo` | `(path: string) => void` | — | Callback when Web Previews plugin requests navigation |
| `currentPath` | string | — | Current pathname to sync with Web Previews plugin |
| `enableClickToEdit` | `boolean \| ClickToEditOptions` | — | Enable click-to-edit overlays persistently |
| `stripStega` | boolean | — | Remove stega encoding from text nodes after processing |
| `root` | `ParentNode` | — | Limit scanning to a root element instead of entire document |

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

```svelte
<span data-datocms-content-link-url={product._editingUrl}>
  ${product.price}
</span>
```

#### `data-datocms-content-link-source`

Attaches stega metadata without rendering it as content. For elements that can't contain text (`<video>`, `<audio>`, `<iframe>`, etc.):

```svelte
<div data-datocms-content-link-source={video.alt}>
  <video src={video.url} poster={video.posterImage.url} controls />
</div>
```

The value must be a stega-encoded string (any text field from the API works).

#### `data-datocms-content-link-group`

Expands the clickable area to a parent element. By default, only the immediate parent of stega text is clickable. This makes a larger ancestor clickable instead:

```svelte
<article data-datocms-content-link-group>
  <h2>{product.title}</h2>  <!-- stega-encoded -->
  <p>${product.price}</p>
</article>
```

Clicking anywhere in `<article>` opens the editor.

**Important:** A group should contain only one stega-encoded source. Multiple sources in the same group cause a collision warning (last URL wins).

#### `data-datocms-content-link-boundary`

Stops the upward DOM traversal for group resolution. Creates an independent editable region:

```svelte
<div data-datocms-content-link-group>
  <h1>{page.title}</h1>         <!-- opens page title editor -->
  <section data-datocms-content-link-boundary>
    <span>{page.author}</span>  <!-- opens author editor (not page title) -->
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

```svelte
<div data-datocms-content-link-group>
  <StructuredText data={page.content} />
</div>
```

**Rule 2:** Add boundary on block, inline block, and inline item components — but **NOT** on item link components:

```svelte
<script>
  import { StructuredText } from '@datocms/svelte';
  import { isBlock, isInlineBlock, isInlineItem, isItemLink } from 'datocms-structured-text-utils';
  import Block from './Block.svelte';
  import InlineBlock from './InlineBlock.svelte';
  import InlineItem from './InlineItem.svelte';
  import ItemLink from './ItemLink.svelte';
</script>

<div data-datocms-content-link-group>
  <StructuredText
    data={page.content}
    components={[
      [isBlock, Block],
      [isInlineBlock, InlineBlock],
      [isInlineItem, InlineItem],
      [isItemLink, ItemLink],
    ]}
  />
</div>
```

Then, in your custom components, wrap the root element with `data-datocms-content-link-boundary`:

```svelte
<!-- Block.svelte -->
<script>
  const { block } = $props();
</script>

<div data-datocms-content-link-boundary>
  <h2>{block.title}</h2>
  <p>{block.description}</p>
</div>
```

```svelte
<!-- InlineBlock.svelte -->
<script>
  const { block } = $props();
</script>

<span data-datocms-content-link-boundary>
  <em>{block.username}</em>
</span>
```

```svelte
<!-- InlineItem.svelte -->
<script>
  const { link } = $props();
</script>

<span data-datocms-content-link-boundary>
  {link.title}
</span>
```

Item link components don't need a boundary — their content belongs to the surrounding structured text:

```svelte
<!-- ItemLink.svelte -->
<script>
  const { link } = $props();
</script>

<a href={`/posts/${link.slug}`}>
  <slot />
</a>
```

**Why item link components don't need a boundary:** Record links are `<a>` tags wrapping text that belongs to the surrounding structured text — no separate editing target, no collision.

## Low-Level Utilities

### `stripStega`

Removes stega encoding from any data type:

```ts
import { stripStega } from '@datocms/svelte';

stripStega("Hello world")           // clean string
stripStega({ name: "John", age: 30 }) // clean object
stripStega(["First", "Second"])      // clean array
```

### `decodeStega`

Extracts editing metadata from stega-encoded content:

```ts
import { decodeStega } from '@datocms/svelte';

const decoded = decodeStega(text);
if (decoded) {
  console.log('Editing URL:', decoded.url);
  console.log('Clean text:', decoded.cleanText);
}
```

### `revealStega` (debugging)

Replaces each invisible stega segment with a visible `[STEGA:/editor/...]` marker. Preserves the input shape — strings stay strings, objects/arrays keep their structure. Use this whenever a stega-related bug is suspected, since `console.log` alone shows nothing (the encoding is zero-width Unicode):

```ts
import { revealStega } from '@datocms/svelte';

console.log(revealStega(page.title));        // "Hello[STEGA:/editor/...]"
console.log(revealStega(graphqlResponse));   // same object shape, markers visible inside strings
```

See [content-link-concepts.md → When to Strip Stega](./content-link-concepts.md#when-to-strip-stega) for the full rule on when to wrap values in `stripStega()` (string comparisons, SEO/meta, analytics, slug/URL generation, anything other than direct render). Note: DatoCMS `slug` field types are never stega-encoded and don't need stripping.

## Troubleshooting

### Click-to-edit overlays not appearing

1. Verify `contentLink: 'v1'` and `baseEditingUrl` are set in API calls
2. Check that `<ContentLink />` is mounted in your component tree
3. Enable click-to-edit: `<ContentLink enableClickToEdit={true} />` or hold Alt/Option
4. Check browser console for errors

### Navigation not syncing with Web Previews plugin

1. Provide both `onNavigateTo` and `currentPath` props
2. Verify `currentPath` updates on navigation (use `page.url.pathname` in SvelteKit)

### StructuredText blocks not clickable

1. Wrap with `data-datocms-content-link-group`
2. Add `data-datocms-content-link-boundary` to block, inline block, and inline item components

### Layout issues from stega encoding

1. Use `stripStega` prop: `<ContentLink stripStega={true} />`
2. Or CSS fix: `[data-datocms-contains-stega] { letter-spacing: 0 !important; }`
