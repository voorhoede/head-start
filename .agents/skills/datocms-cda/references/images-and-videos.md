# Images and Videos

Covers `responsiveImage` queries, imgix parameters, placeholder images, focal points, upload/asset fields, and Mux video integration.

## Contents

- `responsiveImage` Query
- Common imgix Parameters
- Placeholder Images
- Focal Point
- Upload / File Field Properties
- Video (Mux Integration)
- Complete Example

## `responsiveImage` Query

The `responsiveImage` sub-selection on file/asset fields returns a pre-computed responsive image object ready for `<img>` or `<picture>` elements. It accepts `imgixParams` for image transformations and an optional `sizes` attribute.

```graphql
query {
  blogPost(filter: { slug: { eq: "hello-world" } }) {
    coverImage {
      responsiveImage(
        imgixParams: { fm: jpg, fit: crop, w: 800, h: 400 }
        sizes: "(max-width: 800px) 100vw, 800px"
      ) {
        src
        srcSet
        webpSrcSet
        sizes
        width
        height
        aspectRatio
        alt
        title
        base64
        bgColor
      }
    }
  }
}
```

### `responsiveImage` Fields

| Field | Type | Description |
| - | - | - |
| `src` | `String` | The fallback image URL |
| `srcSet` | `String` | HTML5 `srcSet` attribute for multiple resolutions |
| `webpSrcSet` | `String` | `srcSet` in WebP format for supporting browsers |
| `sizes` | `String` | HTML5 `sizes` attribute (media query conditions) |
| `width` | `Int!` | Image width in pixels |
| `height` | `Int` | Image height in pixels |
| `aspectRatio` | `Float` | Width / height ratio |
| `alt` | `String` | Alternative text for accessibility |
| `title` | `String` | Title attribute |
| `base64` | `String` | Base64-encoded Low Quality Image Placeholder (LQIP) |
| `bgColor` | `String` | Background color placeholder (hex string, alternative to base64) |

## Common imgix Parameters

DatoCMS supports **all** imgix URL API parameters. Common ones:

| Parameter | Type | Description |
| - | - | - |
| `w` | `Int` | Width |
| `h` | `Int` | Height |
| `fit` | `ImgixParamsFit` | Resize mode: `crop`, `clip`, `fill`, `max`, `min`, `scale` |
| `auto` | `ImgixParamsAuto` | Automatic optimizations. Pass a single value (`auto: format`) or an array (`auto: [format, compress]`) |
| `fm` | `ImgixParamsFm` | Output format: `jpg`, `png`, `webp`, `gif`, `avif` |
| `q` | `Int` | Quality (1-100) |
| `crop` | `ImgixParamsCrop` | Crop mode: `focalpoint`, `faces`, `entropy`, `edges`, `top`, `bottom`, `left`, `right`, `center` |
| `ar` | `String` | Aspect ratio (e.g., `"16:9"`) |
| `dpr` | `Int` | Device pixel ratio |
| `blur` | `Int` | Gaussian blur (0-2000) |
| `sat` | `Int` | Saturation (-100 to 100) |

```graphql
responsiveImage(
  imgixParams: { w: 600, h: 400, fit: crop, auto: format, q: 80 }
) {
  src
  srcSet
  width
  height
}
```

**Warning:** Using `trim`, `padding`, or `rotation` imgix parameters causes the API to return incorrect `width` and `height` values. You must manually calculate and override these in your frontend.

**Advanced imgix transformations** (text overlays, face detection cropping, color space, auto-enhance, red-eye removal, etc.) are all supported. See the full imgix URL API reference at <https://docs.imgix.com/apis/url> for the complete list of parameters.

## Placeholder Images

Several placeholder strategies are available directly on file/upload fields (not inside `responsiveImage`):

| Field | Type | Description |
| - | - | - |
| `blurUpThumb` | `String` | Data URL of a tiny blurred thumbnail (\~20px wide) |
| `blurhash` | `String` | BlurHash encoding (compact placeholder) |
| `thumbhash` | `String` | ThumbHash encoding (higher quality than blurhash) |
| `colors` | `[ColorField]` | Dominant colors. Each has a `hex` field. |

```graphql
query {
  blogPost(filter: { slug: { eq: "hello-world" } }) {
    coverImage {
      blurUpThumb
      blurhash
      thumbhash
      colors { hex }
      responsiveImage(imgixParams: { w: 800 }) {
        src
        srcSet
        width
        height
        alt
        base64
      }
    }
  }
}
```

**`base64`** (inside `responsiveImage`) and **`blurUpThumb`** (on the file field) both provide LQIP thumbnails. `base64` is computed based on the imgix transformation parameters, while `blurUpThumb` is a fixed tiny thumbnail of the original image.

## Focal Point

Images can have a focal point set in the DatoCMS admin. Query it and use with imgix's `crop: focalpoint` mode:

```graphql
query {
  blogPost(filter: { slug: { eq: "hello-world" } }) {
    coverImage {
      focalPoint {
        x
        y
      }
      responsiveImage(
        imgixParams: { w: 800, h: 400, fit: crop, crop: focalpoint }
      ) {
        src
        srcSet
        width
        height
        alt
      }
    }
  }
}
```

`focalPoint.x` and `focalPoint.y` are floats from 0 to 1 representing the relative position. When `crop: focalpoint` is used in imgix params, the focal point is automatically applied — you do not need to pass `fp-x` and `fp-y` manually.

## Upload / File Field Properties

All upload/file GraphQL types implement the `FileFieldInterface` interface (analogous to `RecordInterface` for records), enabling polymorphic queries across different file field types.

All fields available on a file/upload field:

| Field | Type | Description |
| - | - | - |
| `id` | `UploadId` | Internal DatoCMS upload ID |
| `url` | `String` | The asset URL (on imgix CDN for images) |
| `format` | `String` | File extension (e.g., `"jpg"`, `"png"`, `"pdf"`) |
| `filename` | `String` | Full original filename |
| `basename` | `String` | Filename without extension |
| `mimeType` | `String` | MIME type |
| `size` | `IntType` | File size in bytes |
| `width` | `Int` | Image width in pixels (null for non-images) |
| `height` | `Int` | Image height in pixels (null for non-images) |
| `alt` | `String` | Alternative text |
| `title` | `String` | Title |
| `tags` | `[String]` | User-assigned tags |
| `smartTags` | `[String]` | AI-generated tags |
| `customData` | `CustomData` | Custom key-value metadata |
| `author` | `String` | Author attribution |
| `copyright` | `String` | Copyright information |
| `notes` | `String` | Internal notes |
| `colors` | `[ColorField]` | Dominant colors (each with `hex`) |
| `blurhash` | `String` | BlurHash placeholder encoding |
| `thumbhash` | `String` | ThumbHash placeholder encoding |
| `blurUpThumb` | `String` | Data URL blurred thumbnail |
| `exifInfo` | `CustomData` | EXIF metadata for images (camera, exposure, etc.) |
| `focalPoint` | `FocalPoint` | Contains `x` and `y` (0-1 floats) |
| `responsiveImage(...)` | `ResponsiveImage` | Responsive image sub-selection (images only) |
| `video` | `UploadVideoField` | Video metadata (Mux videos only) |

The `url` field also accepts imgix parameters directly:

```graphql
url(imgixParams: { w: 200, h: 200, fit: crop })
```

**Default optimization bypass:** DatoCMS projects apply automatic image optimization (typically `auto=format`) to all image URLs by default. To bypass these defaults on a specific URL, append `?skip-default-optimizations=true` to the raw image URL (not applicable when using `imgixParams` in GraphQL, which always override defaults for specified params).

## Video (Mux Integration)

Video fields use Mux for processing and delivery. The `video` sub-field provides streaming and download URLs:

```graphql
query {
  blogPost(filter: { slug: { eq: "hello-world" } }) {
    videoField {
      video {
        muxPlaybackId
        streamingUrl
        mp4Url(res: high)
        thumbnailUrl(format: jpg)
        width
        height
        duration
        framerate
        thumbhash
      }
    }
  }
}
```

### Video Fields

| Field | Type | Description |
| - | - | - |
| `muxPlaybackId` | `String` | Mux playback ID (use with Mux Player or HLS.js) |
| `streamingUrl` | `String` | HLS streaming URL (`https://stream.mux.com/{id}.m3u8`) |
| `mp4Url(res: ResolutionEnum)` | `String` | Direct MP4 URL. `res`: `high`, `medium`, or `low` |
| `thumbnailUrl(format: ThumbnailFormatEnum)` | `String` | Video thumbnail. `format`: `jpg`, `png`, or `gif` |
| `width` | `Int` | Video width in pixels |
| `height` | `Int` | Video height in pixels |
| `duration` | `Float` | Duration in seconds |
| `framerate` | `Float` | Frames per second |
| `thumbhash` | `String` | Base64 preview encoding for placeholder |

**HLS streaming is recommended over MP4** for better adaptive bitrate and performance. Use `muxPlaybackId` with a Mux-compatible player or `streamingUrl` with HLS.js.

**Limit streaming resolution:** Append `?max_resolution=1080p` to the HLS URL (e.g., `https://stream.mux.com/{ID}.m3u8?max_resolution=1080p`) to cap the maximum resolution. Accepted values: `720p`, `1080p`, `1440p`, `2160p`.

**Raw video URLs return 422:** DatoCMS blocks direct access to raw video files by default ("Block Serving Raw Videos" setting). Always use HLS streaming or MP4 download URLs from the `video` field instead.

### Framework Video Players

| Framework | Package | Component |
| - | - | - |
| React | `react-datocms` | `<VideoPlayer>` |
| Vue | `vue-datocms` | `<VideoPlayer>` |
| Svelte | `@datocms/svelte` | `<VideoPlayer>` |

These components accept `data` (the video field result) and handle HLS playback automatically.

## Complete Example

```ts
import { executeQuery } from "@datocms/cda-client";

const query = `
  query HeroImage($slug: String!) {
    blogPost(filter: { slug: { eq: $slug } }) {
      title
      coverImage {
        responsiveImage(
          imgixParams: { w: 1200, h: 630, fit: crop, auto: format }
          sizes: "(max-width: 1200px) 100vw, 1200px"
        ) {
          src
          srcSet
          webpSrcSet
          sizes
          width
          height
          aspectRatio
          alt
          title
          base64
        }
        focalPoint { x y }
        blurhash
        colors { hex }
      }
    }
  }
`;

const data = await executeQuery(query, {
  token: process.env.DATOCMS_CDA_TOKEN!,
  variables: { slug: "hello-world" },
});

const image = data.blogPost?.coverImage?.responsiveImage;
if (!image) throw new Error("Blog post or cover image not found");

// Use in an <img> element:
// <img
//   src={image.src}
//   srcSet={image.srcSet}
//   sizes={image.sizes}
//   width={image.width}
//   height={image.height}
//   alt={image.alt}
//   style={{ backgroundImage: `url(${image.base64})`, backgroundSize: 'cover' }}
// />
```
