type BunnyRuntime = import('@bunny.net/astro-adapter').BunnyRuntime;

declare namespace App {
  interface Locals {
    runtime: BunnyRuntime;
    datocmsEnvironment: string;
    datocmsToken: string;
    isPreview: boolean;
    isPreviewAuthOk: boolean;
    editModeOn: boolean;
    previewSecret?: string;
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
