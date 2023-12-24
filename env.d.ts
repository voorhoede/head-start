declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CI?: string;
      CF_PAGES?: string;
      CF_PAGES_BRANCH?: string;
      CF_PAGES_URL?: string;
      DATOCMS_API_TOKEN: string;
      DATOCMS_READONLY_API_TOKEN: string;
      HEAD_START_PREVIEW?: string;
      HEAD_START_PREVIEW_SECRET: string;
    }
  }
}

export {};
