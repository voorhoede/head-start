# Content Editor Guide

Welcome to your CMS! This guide helps you understand how content is organised and how to create and manage it effectively.

## Table of contents

- [Pages](#pages)
  - [Creating a new page](#creating-a-new-page)
- [Content Blocks](#content-blocks)
  - [Available blocks](#available-blocks)
  - [Tips for working with blocks](#tips-for-working-with-blocks)
- [Media and Assets](#media-and-assets)
- [Multilingual content](#multilingual-content)
- [Further reading](#further-reading)

## Pages

Your website is built from **Pages**. Each page has:

- **Title** - the main heading displayed on the page.
- **Slug** - the URL-friendly version of the title (e.g. `about-us`). This determines the page's web address.
- **Parent page** - pages can be nested under other pages to create a hierarchy (e.g. `/services/consulting/`).
- **Body blocks** - the content of the page, composed of reusable content blocks (see below).

There are a few special page types:

| Page type          | Purpose                                                           |
| ------------------ | ----------------------------------------------------------------- |
| **Home Page**      | The landing page of your website. There is only one.              |
| **Page**           | A regular content page. You can create as many as you need.       |
| **Not Found Page** | Shown when a visitor navigates to a URL that doesn't exist (404). |

### Creating a new page

1. Go to **Content** in the main menu and select the **Page** model.
2. Click **+ New record**.
3. Fill in the **Title** - the slug will be generated automatically.
4. Optionally set a **Parent page** to nest it in the site hierarchy.
5. Add content using **Body blocks** (see the next section).
6. Click **Save** and then **Publish** when you're ready to make it live.

## Content Blocks

Pages are built using **Content Blocks** - modular pieces of content that you can mix and match. Think of them as building blocks: each one serves a specific purpose, and you combine them to compose a full page.

To add a block, click the **+** button in the body blocks field and choose the type you need.

![Body blocks](/editor-guide/body-blocks.png)

### Available blocks

| Block                  | What it does                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Text Block**         | Rich text content: paragraphs, headings, lists, quotes, and inline media. The most common block for body copy. |
| **Image Block**        | Displays a single image with an optional caption.                                                              |
| **Text Image Block**   | Rich text alongside an image, side by side. The image can appear on the left or right.                         |
| **Action Block**       | One or more buttons or links. Supports internal pages, external URLs, email addresses, and phone numbers.      |
| **Video Block**        | Plays a video uploaded directly to the CMS. Supports captions, autoplay, loop, and mute.                       |
| **Video Embed Block**  | Embeds a video from YouTube or Vimeo using a URL. Use this when the video is hosted externally.                |
| **Embed Block**        | Embeds external content from a URL. Works with YouTube, Vimeo, Twitter/X, maps, and other providers.           |
| **Table Block**        | Displays data in a table with optional header row and column.                                                  |
| **Grouping Block**     | Groups multiple blocks together. Choose a layout: stack, accordion, or tabs.                                   |
| **Page Partial Block** | Reuses a saved Page Partial - a shared set of blocks that can appear on multiple pages.                        |
| **Counter Block**      | Displays an animated counter that counts up to a target number.                                                |

### Tips for working with blocks

- **Reorder blocks** by dragging them up or down within the body blocks field.
- **Duplicate a block** to quickly create a similar section without starting from scratch.
- **Copy and paste blocks** using the inline menu on each block. You can paste them on the same page or on a different page. This also works in bulk by selecting multiple blocks.
- **Hover over a block** when adding a new one to see a preview image of what it looks like.
- **Page Partials** are great for content that appears on multiple pages (e.g. a call-to-action or contact section). Edit the partial once, and it updates everywhere.

For more detail, watch the DatoCMS video on [working with modular content](https://www.datocms.com/user-guides/content-management/building-pages-and-deep-dive-into-modular-content).

## Media and Assets

All images, videos, and files are managed in the **Media Area** (accessible from the main menu). From there you can:

- **Upload** new assets by dragging and dropping files or clicking the upload button.
- **Organise** assets into folders to keep things tidy.
- **Search** for assets by filename or metadata.
- **Edit metadata** - add alt text to images for accessibility, and titles for additional context.

When you add an image or video to a block, you can either upload a new file or pick an existing one from the Media Area.

> **Tip**: Always add descriptive **alt text** to images. This improves accessibility for visitors using screen readers and helps with SEO.

For more detail, watch the DatoCMS video on [intro to the asset area](https://www.datocms.com/user-guides/the-basics/intro-to-the-asset-area)

## Multilingual content

Your CMS supports multiple languages. When editing a record, you'll see a language switcher that lets you toggle between locales. Make sure to fill in content for each active language before publishing.

## Further reading

For more detailed guidance, check out these resources from DatoCMS:

- [Deep dive into Structured Text](https://www.datocms.com/user-guides/content-management/deep-dive-into-structured-text-in-datocms) - essential video on working with rich text fields.
- [Building pages with Modular Content](https://www.datocms.com/user-guides/content-management/building-pages-and-deep-dive-into-modular-content) - essential video on composing pages with blocks.
- [Content Modelling](https://www.datocms.com/docs/content-modelling) - understand how models, fields, and blocks are structured (for advanced users).
