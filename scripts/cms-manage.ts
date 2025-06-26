import { select } from '@inquirer/prompts';

async function run() {
  const answer = await select({
    message: 'What do you want to achieve in your DatoCMS project?',
    choices: [
      {
        name: '🆕 start development in a new sandbox environment',
        value: 'env:create',
        description:
          'Create a new sandbox environment. You can set the name of the sandbox environment and wheter you would like to run all new migration files or not.',
      },
      {
        name: '🔁 sync my sandbox environment with migration files',
        value: 'env:sync',
        description:
          'Sync your sandbox environment will run all new migrations in-place. You can choose the name of the target sandbox environment.',
      },
      {
        name: '🗑️ get rid of old sandbox environment',
        value: 'env:destroy',
        description:
          'Destroy a sandbox environment. You can choose the name of the target sandbox environment. This will delete all content in the environment.',
      },
      {
        name: '🧪 test run my migrations in a new env',
        value: 'env:create',
        description:
          'Create a new sandbox environment. Ensure that you select YES when asked to run all new migration files in the new environment.',
      },
      {
        name: '🔄 generate migration files',
        value: 'migration:generate',
        description:
          'Generate migration files. This will create a new migration file in the `migrations` directory that has all schema changes between the primary environment and the target sandbox environment.',
      },
      {
        name: '🚀 promote sandbox environment to production',
        value: 'env:promote',
        description:
          'Promote a sandbox environment to primary. You will have the option to delete the old primary environment upon success.',
      },
    ],
  });

  console.log(answer);


  switch (answer) {
  case 'env:create':  
    // TODO: improve creation script
    // - ask for name of the environment
    // - ask if you want to run all new migration files
    // - upon succes, update local environment variable in datocms-environment.ts
    // - upon success, give feedback
    // await cmsCreateEnvironment();
    break;
  case 'env:sync':
    // TODO: add sync script instead of migrations:run
    // - ask for verification to run migrations in-place
    // - ask for name of the environment
    // - upon success, update local environment variable in datocms-environment.ts
    // - upon success, give feedback
    // await cmsSyncEnvironment();
    break;
  case 'env:destroy':
    // TODO: improve destroy script
    // - ask for verification to destroy the environment, Action is irreversible
    // - ask for name of the environment
    // - upon succes, give feedback
    // - upon success, ask if user wants to rename local environment variable in datocms-environment.ts
    // - upon success, update local environment variable in datocms-environment.ts
    // await cmsDestroyEnvironment();
    break;
  case 'migration:generate':
    // TODO: improve migration generation script
    // - ask for name of the environment
    // - upon success, give feedback
    // await cmsGenerateMigration();
    break;
  case 'env:promote':
    // TODO: improve promote script
    // - ask for name of the environment
    // - ask for verification to promote the environment
    // - maintenance on primary environment
    // - promote sandbox environment to primary
    // - maintenance off primary environment
    // - upon success, update local environment variable in datocms-environment.ts
    // - upon success, ask if user wants to delete the old primary environment
    // - upon success, delete the old primary environment
    // - upon success, give feedback
    // await cmsPromoteEnvironment();
    break;
  }
}

run();
