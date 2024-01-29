# Video Embed Block

**Embeds an [external video](https://www.datocms.com/docs/content-modelling/external-video-field) from YouTube or Vimeo with a cover image, caption and options to autoplay, mute and loop.**

## Features

- Supports both YouTube and Vimeo vidoes.
- Supports caption defaulting to external video's title and optional custom title override.
- Supports autoplay, mute and loop.
- Reserves space for image to prevent page reflow.
- Conditionally loads video on click or when autoplay is set.
- Has a responsive video cover image that lazy loads image for better performance.
- Requires user to give consent due to third party tracking (see [#49: consent manager](https://github.com/voorhoede/head-start/issues/49)). Alternatively use [Video Block](../VideoBlock/) with video uploaded in DatoCMS, served without tracking.
