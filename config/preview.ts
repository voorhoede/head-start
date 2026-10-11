/**
 * Preview mode renders every page on request (`output: 'server'`) and includes
 * draft content. It is switched on with the `HEAD_START_PREVIEW` environment
 * variable, which the preview Worker sets as a build variable
 * (see docs/preview-mode.md). Locally, set it in `.env`.
 */
export const isPreview = ['true', '1'].includes(
  (process.env.HEAD_START_PREVIEW || '').toLowerCase(),
);
