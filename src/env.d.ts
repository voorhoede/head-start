/// <reference types="astro/client" />
declare namespace App {
  interface Locals {
    datocmsEnvironment: string;
    datocmsToken: string;
    isPreview: boolean;
    isPreviewAuthOk: boolean;
    previewSecret: string;
  }
}
declare module '*.query.graphql' {
  import { DocumentNode } from 'graphql';
  const value: DocumentNode;
  export = value;
}
