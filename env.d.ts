declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CI?: string;
      GITHUB_ACTIONS?: string;
      GITHUB_HEAD_REF?: string;
      GITHUB_REF_NAME?: string;
      DATOCMS_API_TOKEN: string;
      DATOCMS_READONLY_API_TOKEN: string;
      HEAD_START_PREVIEW?: string;
      HEAD_START_PREVIEW_SECRET: string;
    }
  }
}

export {};
