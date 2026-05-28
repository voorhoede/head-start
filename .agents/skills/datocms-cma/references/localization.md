# Localization

Covers working with localized field values and the normalized field value utilities.

> Endpoint shapes touching localized fields: `npx datocms cma:docs {items <action>|site update}` (add `--expand-types '*'` for full TS definitions). This file covers the per-locale value shape, `all_locales_required` semantics, and the partial-vs-full-update rule for localized fields.

## Contents

- Localized vs Non-Localized Values
- Getting Available Locales
- Creating Records with Localized Fields
- Updating Localized Fields
- Localized File Fields
- Checking if a Field is Localized
- Normalized Field Value Utilities
- Complete Example: Migrate Content to a New Locale

## Localized vs Non-Localized Values

When a field is **not** localized, its value is a plain value:

```ts
{ title: "Hello World" }
```

When a field **is** localized, its value is an object keyed by locale code:

```ts
{ title: { en: "Hello World", it: "Ciao Mondo", de: "Hallo Welt" } }
```

This applies to all field types — strings, files, links, blocks, structured text, etc.

## Getting Available Locales

```ts
const site = await client.site.find();
console.log(site.locales); // ["en", "it", "de"]
```

The first locale in the array is the primary locale.

## Creating Records with Localized Fields

```ts
const record = await client.items.create({
  item_type: { id: modelId, type: "item_type" },
  // Non-localized field — plain value
  slug: "hello-world",
  // Localized field — object keyed by locale
  title: {
    en: "Hello World",
    it: "Ciao Mondo",
  },
  body: {
    en: "English content here",
    it: "Contenuto italiano qui",
  },
});
```

**Important:** If the model has `all_locales_required: true`, you must provide values for every locale on the site. If `all_locales_required: false`, you can provide values for only some locales.

## Updating Localized Fields

When updating a localized field, you provide the full object with all locales — there is no "partial locale update":

```ts
// First, read the current record
const record = await client.items.find("record-id");

// Update only the Italian translation
await client.items.update("record-id", {
  title: {
    ...record.title, // Preserve other locales
    it: "Nuovo Titolo",
  },
});
```

## Localized File Fields

```ts
await client.items.create({
  item_type: { id: modelId, type: "item_type" },
  hero_image: {
    en: {
      upload_id: "upload-en",
      alt: "English hero",
      title: null,
      custom_data: {},
      focal_point: null,
    },
    it: {
      upload_id: "upload-it",
      alt: "Eroe italiano",
      title: null,
      custom_data: {},
      focal_point: null,
    },
  },
});
```

## Checking if a Field is Localized

```ts
import { isLocalized } from "@datocms/cma-client-node";

const fields = await client.fields.list(model.id);

for (const field of fields) {
  if (isLocalized(field)) {
    console.log(`${field.api_key} is localized`);
  }
}
```

## Normalized Field Value Utilities

These utilities let you work with field values uniformly, regardless of whether they are localized. They abstract away the `string` vs `{ en: string, it: string }` distinction.

All utilities are imported from the same package as `buildClient`.

### `toNormalizedFieldValueEntries()`

Convert any field value into a flat array of `{ locale, value }` entries:

```ts
import { toNormalizedFieldValueEntries } from "@datocms/cma-client-node";

// For a non-localized field:
const entries = toNormalizedFieldValueEntries("Hello", field);
// → [{ locale: undefined, value: "Hello" }]

// For a localized field:
const entries = toNormalizedFieldValueEntries(
  { en: "Hello", it: "Ciao" },
  field,
);
// → [{ locale: "en", value: "Hello" }, { locale: "it", value: "Ciao" }]
```

### `fromNormalizedFieldValueEntries()`

Convert entries back to the original format:

```ts
import { fromNormalizedFieldValueEntries } from "@datocms/cma-client-node";

// For a non-localized field:
const value = fromNormalizedFieldValueEntries(
  [{ locale: undefined, value: "Hello" }],
  field,
);
// → "Hello"

// For a localized field:
const value = fromNormalizedFieldValueEntries(
  [{ locale: "en", value: "Hello" }, { locale: "it", value: "Ciao" }],
  field,
);
// → { en: "Hello", it: "Ciao" }
```

### `mapNormalizedFieldValues()`

Transform all locale values of a field:

```ts
import { mapNormalizedFieldValues } from "@datocms/cma-client-node";

// Uppercase all values, regardless of localization
const uppercased = mapNormalizedFieldValues(
  record.title,
  titleField,
  (locale, value) => value.toUpperCase(),
);
// Non-localized: "HELLO"
// Localized: { en: "HELLO", it: "CIAO" }
```

### Async Variant

```ts
import { mapNormalizedFieldValuesAsync } from "@datocms/cma-client-node";

const translated = await mapNormalizedFieldValuesAsync(
  record.title,
  titleField,
  async (locale, value) => {
    if (locale === "it") return await translateToItalian(value);
    return value;
  },
);
```

### `filterNormalizedFieldValues()`

Filter out locale values that don't match a predicate:

```ts
import { filterNormalizedFieldValues } from "@datocms/cma-client-node";

// Remove empty strings
const filtered = filterNormalizedFieldValues(
  record.title,
  titleField,
  (locale, value) => value.length > 0,
);
```

### `someNormalizedFieldValues()`

Check if at least one locale value matches:

```ts
import { someNormalizedFieldValues } from "@datocms/cma-client-node";

const hasContent = someNormalizedFieldValues(
  record.body,
  bodyField,
  (locale, value) => value.length > 0,
);
```

### `everyNormalizedFieldValue()`

Check if all locale values match:

```ts
import { everyNormalizedFieldValue } from "@datocms/cma-client-node";

const allFilled = everyNormalizedFieldValue(
  record.title,
  titleField,
  (locale, value) => value.length > 0,
);
```

### `visitNormalizedFieldValues()`

Execute a side-effect for each locale value (no return value):

```ts
import { visitNormalizedFieldValues } from "@datocms/cma-client-node";

visitNormalizedFieldValues(
  record.title,
  titleField,
  (locale, value) => {
    console.log(`${locale ?? "default"}: ${value}`);
  },
);
```

### Complete List of Async Variants

Every function above has an async counterpart:

- `mapNormalizedFieldValuesAsync()`
- `filterNormalizedFieldValuesAsync()`
- `someNormalizedFieldValuesAsync()`
- `everyNormalizedFieldValueAsync()`
- `visitNormalizedFieldValuesAsync()`

## Complete Example: Migrate Content to a New Locale

```ts
import {
  buildClient,
  toNormalizedFieldValueEntries,
  fromNormalizedFieldValueEntries,
} from "@datocms/cma-client-node";

const client = buildClient({
  apiToken: process.env.DATOCMS_API_TOKEN!,
});

async function addFrenchLocale() {
  const model = (await client.itemTypes.list()).find(
    (m) => m.api_key === "blog_post",
  );
  if (!model) throw new Error("Model not found");

  const fields = await client.fields.list(model.id);
  const localizedFields = fields.filter((f) => f.localized);

  let count = 0;

  for await (const record of client.items.listPagedIterator<Schema.BlogPost>({
    filter: { type: "blog_post" },
  })) {
    const updates: Record<string, unknown> = {};

    for (const field of localizedFields) {
      const fieldValue = record[field.api_key];
      if (!fieldValue) continue;

      const entries = toNormalizedFieldValueEntries(fieldValue, field);
      const enEntry = entries.find((e) => e.locale === "en");

      if (enEntry && !entries.find((e) => e.locale === "fr")) {
        // Copy English value as placeholder for French
        entries.push({ locale: "fr", value: enEntry.value });
        updates[field.api_key] = fromNormalizedFieldValueEntries(
          entries,
          field,
        );
      }
    }

    if (Object.keys(updates).length > 0) {
      await client.items.update(record.id, updates);
      count++;
      console.log(`Updated record ${record.id} (${count})`);
    }
  }

  console.log(`Done. Updated ${count} records.`);
}

addFrenchLocale().catch(console.error);
```
