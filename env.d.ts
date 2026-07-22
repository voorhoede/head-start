declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CI?: string;
      WORKERS_CI?: string;
      WORKERS_CI_BRANCH?: string;
      WORKERS_CI_COMMIT_SHA?: string;
      DATOCMS_API_TOKEN: string;
      DATOCMS_READONLY_API_TOKEN: string;
      HEAD_START_PREVIEW?: string;
      HEAD_START_PREVIEW_SECRET: string;
    }
  }
}

export {};
