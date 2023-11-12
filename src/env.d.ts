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
