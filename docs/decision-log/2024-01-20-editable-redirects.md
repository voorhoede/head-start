# Editable redirects

**Compile editable redirect rules in the CMS to a [Cloudflare Pages `_redirects` file](https://developers.cloudflare.com/pages/configuration/redirects/).**

- Date: 2024-01-20
- Alternatives Considered: compile to [Astro redirects](https://docs.astro.build/en/reference/configuration-reference/#redirects); use link field with InternalLink record instead of single line string field for "To URL" field.
- Decision Made By: [Jasper](https://github.com/jbmoelker)

## Decision

### Use Cloudflare Pages to handle redirects

Both Astro and Cloudflare Pages offer functionality to handle redirects: [Astro redirects](https://docs.astro.build/en/reference/configuration-reference/#redirects) and [Cloudflare Pages `_redirects` file](https://developers.cloudflare.com/pages/configuration/redirects/). However the redirect destination in Astro redirects configuration requires knowledge of the avalable file based routes in the code base which content editors in the CMS don't have. The Cloudflare Pages redirects offer functionality from a user perspective and are therefore preferred. 

### Use single line string for To URL field

A redirect rule is typically defined to redirect to an existing page in the CMS, so it would potentially make sense to use a link field referencing an Internal Link record to resolve the URL to redirect to. However the redirect source (From URL) may not match the available locales of an Internal Link record target. This would mean the From URL needs to be localised, which complicates the setup. See [comments on redirects issue](https://github.com/voorhoede/head-start/issues/64#issuecomment-1852715925). So instead the editable redirects offer a simple single line string field for both the From URL and To URL field in the CMS.
