# VideoBlock

**Renders a video uploaded in DatoCMS with a cover image, caption, support for subtitles and options to autoplay, mute and loop.**

## Features

- Privacy first alternative to [Video Embed Block](../VideoEmbedBlock/), as video uploaded in DatoCMS is served without tracking (no consent required).
- Supports video streaming with adaptive bitrate (using HLS) for best UX and performance.
- Fallback to mp4 video when streaming is not available.
- Fallback to video download link when HTML video element is not supported.
- Supports subtitle tracks for enhanced accessibility, automatically selecting default locale when available.
- Supports figcaption defaulting to external video's title and optional custom title override.
- Supports autoplay, mute and loop.
- Autoplay is only triggered if no reduced motion is preferred (for a11y) and save data mode is off.
- Conditionally loads video and streaming package (`hls.js`) on click or when in view in case autoplay is enabled.
