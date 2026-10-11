type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    datocmsEnvironment: string;
    datocmsToken: string;
    isPreview: boolean;
    isPreviewAuthOk: boolean;
    editModeOn: boolean;
    previewSecret: string;
  }
}

declare module '*.query.graphql' {
  import { DocumentNode } from 'graphql';
  const value: DocumentNode;
  export = value;
}

declare module '*.fragment.graphql' {
  import { DocumentNode } from 'graphql';
  const value: DocumentNode;
  export default value;
}

/**
 * Bindings of the Cloudflare Worker, see src/pages/api/content/[...path].md.ts.
 * @see https://developers.cloudflare.com/workers/runtime-apis/bindings/#how-to-access-env
 */
declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>;
}
