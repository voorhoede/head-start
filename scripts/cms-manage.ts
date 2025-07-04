import { select } from '@inquirer/prompts';
import cmsCreateEnvironment from './cms-create-environment';
import cmsDestroyEnvironment from './cms-destroy-environment';
import cmsGenerateMigration from './cms-generate-migration';
import cmsPromoteEnvironment from './cms-promote-environment';
import cmsSyncEnvironment from './cms-sync-environment';
import { color } from './lib/color';
import { catchError } from './lib/exec-command';

const commandMap = new Map<string, () => Promise<void>>([
  ['env:create', cmsCreateEnvironment],
  ['env:sync', cmsSyncEnvironment],
  ['env:destroy', cmsDestroyEnvironment],
  ['migration:generate', cmsGenerateMigration],
  ['env:promote', cmsPromoteEnvironment],
]);

async function run() {
  const answer = await select({
    message: 'What do you want to achieve in your DatoCMS project?',
    choices: [
      {
        name: '🆕 Start development in a new sandbox environment',
        value: 'env:create',
        description:
          'Create a new sandbox environment. You can set the name of the sandbox environment and wheter you would like to run all new migration files or not.',
      },
      {
        name: '🔁 Sync my sandbox environment with migration files',
        value: 'env:sync',
        description:
          'Sync your sandbox environment will run all new migrations in-place. You can choose the name of the target sandbox environment.',
      },
      {
        name: '🗑️  Delete sandbox environment',
        value: 'env:destroy',
        description:
          'Destroy a sandbox environment. You can choose the name of the target sandbox environment. This will delete all content in the environment.',
      },
      {
        name: '🧪 Test run my migrations in a new environment',
        value: 'env:create',
        description:
          'Create a new sandbox environment. Ensure that you select YES when asked to run all new migration files in the new environment.',
      },
      {
        name: '📝 Generate new migration files',
        value: 'migration:generate',
        description: `Generate migration files. This will create a new migration file in the ${color.yellow('migrations')} directory that has all schema changes between the primary environment and the target sandbox environment.`,
      },
      {
        name: '🚀 Promote sandbox environment to production',
        value: 'env:promote',
        description:
          'Promote a sandbox environment to primary. You will have the option to create a new environment first based on your current migrations. You will also have the option to delete the old primary environment upon success.',
      },
    ],
  });

  const command = commandMap.get(answer);
  if (command) {
    await command();
  } else {
    throw new Error(`Unknown command: ${answer}`);
  }
}

run().catch(catchError);
