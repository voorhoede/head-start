# CMS Content Modelling

**Head Start uses DatoCMS and uses content modelling and naming conventions for models and fields.**

## Naming strategy

DatoCMS is a headless CMS, so the content models should be as much UI agnostic as possible. In general naming content models after their data properties is a good practice, because it separates concerns, promotes reusability within the CMS and by the applications connection to the CMS, and content models don't need to change everytime a UI changes.

In Head Start content is named in this order of preference:

1. Naming based on data type (for example `slug`, `image`, `color`).
2. Naming based on function (for example `title`, `autoplay`).
3. Naming based on appearance (for example `layout`, `style`).

Specific cases:

- In case of a boolean field it should be named after its function, as a boolean means nothing without context. For example a `Video Block` could have `autoplay`, `loop` and `muted` boolean fields.
- In case a model has multiple fields of the same data type, the primary field should be named after its data type (for example `image`) and secondary fields should be named after their function (for example `background_image`).
- In case a field is named after its function, the validations you configure for the field are typically a good indicator towards a fitting name. For example if you set a single line string field to only accept a URL as a pattern, `url` is probably a good name for the field.
- In case a field is only added to control the appearance of a model in the user interface, Head Start proposes to solve this with a generic `layout` and `style` field. See [Modelling Appearance](#modelling-appearance).

## Model name conventions

The [DatoCMS Schema builder](https://www.datocms.com/docs/content-modelling) distinguishes regular models and reusable blocks that can be used in modular content and structured text fields.

Head Start uses these standardised model names:

Model name | Model type | Notes
--- | --- | ---
`... Page` | regular model | All pages are regular models with a name that ends with `Page` (`Home Page`, `Product Page` and the generic `Page`). These `Page` models are used by routes in `src/pages/`.
`... Block` | reusable [block](https://www.datocms.com/docs/content-modelling/blocks) | All reusable blocks have a name that ends with `Block` (`Text Block`, `Image Block`, etc). These `Block`s are used by templates and fragments in `src/blocks/`. See [documentation on Blocks and Components](./blocks-and-components.md).

Since a project has multiple pages and multiple blocks, the name should describe the models function. For example a `Newsletter Signup Block`.

## Field name conventions

While there can always be exceptions, Head Start aims to cover the majority of field names with a list of standardised field names:

Field name | Field type | Notes
--- | --- | ---
`title` | single line string field | _Not_ `heading`, `name` (except for persons).
`subtitle` |  single line string field | _Not_ `tagline`, `excerpt`.
`slug` | [slug field](https://www.datocms.com/docs/content-modelling/slug-permalinks) | _Not_ `permalink`, `path`, `url`. use `title` as reference field.
`blocks` | [modular content field](https://www.datocms.com/docs/content-modelling/modular-content) | _Not_ `body`, `content`. Plural to signal its a list.
`items` | [modular content field](https://www.datocms.com/docs/content-modelling/modular-content) | Use when a block field can have multiple items of the same type. For example a `Unique Selling Point Block` where each item has an `title` and a `image` field.
`text` | [structured text field](https://www.datocms.com/docs/content-modelling/structured-text) | _Not_ `body`, `content`, `description`. Prefer over multiple-paragraph text field as structured text offers more flexibility.
`image`(s) | [single asset or asset gallery field](https://www.datocms.com/docs/general-concepts/media-area) | _Not_ `picture`(s), `photo`(s), `avatar`(s). Use plural if intended for an image grid or gallery. Set accept only specified extensions validation to 'allow only images'.
`video` | [single asset field](https://www.datocms.com/docs/general-concepts/videos) or [external video field](https://www.datocms.com/docs/content-modelling/external-video-field) | Type of field depends on video source (uploaded in CMS or 3rd party platform).
`page`(s) | [link(s) field](https://www.datocms.com/docs/content-modelling/links) | Set reference to `InternalLink` model. This model bundles all `... Pages` models and ensures their routes are resolved consistently throughout the codebase.

## Modelling Appearance

In cases where the appearance of a content model needs to be controlled from the CMS, Head Start aims to handle this using two standardised fields:

Field name | Field type | Notes
--- | --- | ---
`layout` | single line string field | Defines position, size and direction. Use pre-defined values by configuring [accept only specified values](https://www.datocms.com/docs/content-modelling/validations#single-line-text) in field validation settings. For example `full-width`, `centered`, `fixed-header`.
`style` | single line string field or [link field](https://www.datocms.com/docs/content-modelling/links) | Defines other visual style properties. Use string field with pre-defined values by configuring [accept only specified values](https://www.datocms.com/docs/content-modelling/validations#single-line-text) or create a dedicated Style model and use a link field to reference it, if the style is used cross-model. For example `highlight`, `branded`, `primary`.

A few example situations:

- A design has a block with two text columns. Avoid creating fields like `text_column_left` and `text_column_right`. Instead create an `items` field (see [Field name conventions](#field-name-conventions)) where each item has a `text` field, and use validations to set a minimum and maximum number of items. Then add a `layout` field to the block with values like `one-column`, `two-columns`, `multi-column`.
- A design has two variations of a block. One with an image on the left and text on the right. The second with the content the other way around. Avoid making multiple blocks or adding an `is_inversed` or `is_image_left` field. Instead create a `layout` field and only allow specific values describing the options, like `image-text` and `text-image`. You can use the presentation of the field to display the options as radio buttons or a dropdown if desired (this doesn't impact the data model). This setup is open to future extension. And if the website later adds right-to-left support the content model doesn't need to change.
- A design has different blocks all showing multiple images. Here conbining an `images` field with a `layout` field with options like `grid` and `gallery` would allow you to model a single content block for both design options. Note: f this feels confusing to editors or if the blocks differ in more ways you may still want to create multiple content blocks in the CMS.
- A design has two variations of a blocks background. Avoid fields like `is_gray` as this makes it difficult to add variations later on, or change an existing variation. Instead use a `style` field with values like `default`, `dimmed` or `highlighted`.
- A design consistently uses multiple style variations across the website. In this case, create a new Style model and create records for each variation. Add `style` link fields to blocks and models referencing the Style model. You can restrict modifying the Style records to admins under [Content Permissions in the CMS](https://www.datocms.com/docs/content-delivery-api/docs/general-concepts/roles-and-permission-system#content-level-permissions).
