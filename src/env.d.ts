/// <reference types="astro/client" />

declare module '*.query.graphql' {
  import { DocumentNode } from 'graphql';
  const value: DocumentNode;
  export = value;
}
