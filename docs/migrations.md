# Migrations

**Head Start uses DatoCMS migrations to develop CMS changes in isolation and ensure they can be reproduced.**

Use migrations when you're making changes to the DatoCMS schema, such as adding or removing fields, models, or relationships. For getting the most out of migrations, we suggest you follow these steps:

## DatoCMS Manager

**If you are ever unsure about what to do, try using the Datocms Manage command**
This will give you a terminal interface that will guide you trough the process of interacting with DatoCMS. Based on your goal, it will help you with the appropriate steps.
All custom commands provided by HeadStart regarding DatoCMS can be accessed via this tool.

```shell
    npm run cms:manage
```

## Development flow with regards to migrations
```
                  +------------------------------+
                  |         Create <env>         |
                  +------------------------------+
                                |
                                V
                  +------------------------------+
                  |       Develop in <env>       |
                  +------------------------------+
                                |
                                V
                  +------------------------------+
                  |      Generate Migration      |
                  +------------------------------+
                                |
                                V
                  +------------------------------+
                  |         Keep <env>?          |
                  +------------------------------+
                        | Yes          | No   
                        V              V
+------------------------------+ +------------------------------+
|   Rename <env> to <env>_OLD  | |   Delete <env> Environment   |
+------------------------------+ +------------------------------+
                        |              |
                        +--------------+
                                |
                                V
                  +------------------------------+
                  |   Create New Sandbox <env>   |
                  |    from Primary with all     |
                  |      migrations applied      |
                  +------------------------------+
                                |
                                V
                  +------------------------------+
                  |  Promote <env> to Primary    |
                  +------------------------------+
```

1. **Create the environment in DatoCMS** Use the command below to create a new sandbox environment in your DatoCMS project.

- Your local `datocmEnvironment` variable in `datocms-environment.ts` will be updated.

```shell
  npm run cms:environments:create
```

2. **Make changes in DatoCMS**: Using the DatoCMS web interface, make the required changes to your models. This could include adding new fields, models, or making any other schema changes you need for your project.

- **Note**: Ensure that you are working in the environment you created in step 1 to avoid affecting the primary environment.

3. **Generate a migration**: After making changes in DatoCMS, generate a migration file using the command below. This will create a new migration file in the `migrations` directory that has all schema changes between the primary environment and the target sandbox environment.

```shell
npm run cms:migrations:create
```

4. **Review and commit the migration**: Check the generated migration file in the `migrations` directory. Ensure it accurately reflects the changes you made in DatoCMS. Once confirmed, commit the migration file to your version control system.

5. **Remove the sandbox environment (optional)**: After committing the migration, remove the environment you created in step 1.

- **Note**: Note that you will lose all content in this environment. If you want to keep the content, rename this environment or use a different environment name in the next steps
  ```shell
  npm run cms:environments:destory
  ```

6. **Test migrations in a new sandbox env**: Use the command below to fork a new environment from the primary environment and run all migrations to verify that it will apply the changes correctly.

- Your local `datocmEnvironment` variable in `datocms-environment.ts` will be updated.

```shell
  npm run cms:environments:create
```

7. **Add data to the created environment**: If you need to add data to the new environment, you can do so using the DatoCMS web interface. If you kept the previous environment (and renamed it), you might also copy data from it to the new one.

8. **Promote environment**: Once you have verified that the migration works, the new environment is set up correctly, and your code changes have been incorporated into the main branch, you can promote the environment to production.

```shell
npm run cms:environments:promote
```

## Syncing your WIP sandbox environment with new migration files

Sometimes you might need to update your sandbox environment with migrations that have been launched to production after your sandbox environment was created.
To ensure your sandbox environment is up to date, use the below sync command to run all migrations in place.

- Your local `datocmEnvironment` variable in `datocms-environment.ts` will be updated.

```
npm run cms:environments:sync
```
