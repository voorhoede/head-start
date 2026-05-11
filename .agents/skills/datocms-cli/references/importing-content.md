# Importing Content

WordPress and Contentful import commands.

## Contents

- Inputs to confirm before running commands
- WordPress Import
- Contentful Import

## Inputs to confirm before running commands

These importers are best treated as onboarding tools for a **new or disposable** DatoCMS target.

Confirm these inputs when they are not already clear:

- whether the target is a disposable/new DatoCMS project or an existing one
- schema-only first vs full import
- content-type narrowing needs
- concurrency / ignore-errors tolerance for large asset sets

If the target is existing or unclear, prefer a staged approach:

- run once **without** `--autoconfirm`
- consider schema-only or narrowed imports first when the importer supports it
- call out any destructive schema-reset behavior explicitly

## WordPress Import

### Installation

```bash
npm install --save-dev @datocms/cli-plugin-wordpress
```

### Command

```bash
npx datocms wordpress:import [flags]
```

Run `npx datocms wordpress:import --help` for all flags. Key flags include `--autoconfirm` (skip prompts), `--concurrency` (default: 15), and `--ignore-errors`.

### Destructive behavior

The importer destroys existing WordPress schema (`wp_*` models) in the DatoCMS target before recreating it.

### Import Steps

1. Destroy existing WordPress schema (`wp_*` models) from DatoCMS
2. Import WordPress metadata (concurrently):
   - Categories
   - Tags
   - Authors
   - Assets
3. Import WordPress content (concurrently):
   - Pages
   - Articles

### Example

```bash
npx datocms wordpress:import \
  --wp-url=https://myblog.wordpress.com \
  --wp-username=admin \
  --wp-password=secret
```

Add `--autoconfirm` only when the operator intentionally wants a non-interactive run.

## Contentful Import

### Installation

```bash
npm install --save-dev @datocms/cli-plugin-contentful
```

### Command

```bash
npx datocms contentful:import [flags]
```

Run `npx datocms contentful:import --help` for all flags. Key flags include `--autoconfirm` (skip prompts), `--concurrency` (default: 15), and `--ignore-errors`.

### Destructive behavior

The importer destroys existing Contentful-shaped schema in the DatoCMS target before recreating it.

### Import Steps

1. Download Contentful schema
2. Destroy existing Contentful schema from DatoCMS
3. Copy Contentful schema:
   - Set locales
   - Import models
   - Import fields
4. Import content (skipped if `--skip-content`):
   - Import assets
   - Import records
5. Add validations to fields

### Examples

```bash
# Full import from Contentful
npx datocms contentful:import \
  --contentful-token=your_token \
  --contentful-space-id=your_space

# Schema-only import (no content)
npx datocms contentful:import \
  --contentful-token=your_token \
  --contentful-space-id=your_space \
  --skip-content

# Import specific content types only
npx datocms contentful:import \
  --contentful-token=your_token \
  --contentful-space-id=your_space \
  --only-content-type=blogPost,landingPage,author
```

Add `--autoconfirm` only when the operator intentionally wants a non-interactive run.
