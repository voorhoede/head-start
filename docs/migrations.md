# Migrations

**Head Start uses DatoCMS migrations to develop CMS changes in isolation and ensure they can be reproduced.**

Use migrations when you're making changes to the DatoCMS schema, such as adding or removing fields, models, or relationships. For getting the most out of migrations, we suggest you follow these steps:

1. **Set a new environment**: Set a new environment in your `datocms-environment.ts` file.
  ```typescript
  export const datocmsEnvironment = 'your-new-environment';
  ```

2. **Create the environment in DatoCMS**: Use the command below to create the environment defined in step 1.
  ```shell
    npm run cms:environments:create
  ```

3. **Make changes in DatoCMS**: Using the DatoCMS web interface, make the required changes to your models. This could include adding new fields, models, or making any other schema changes you need for your project.
  - **Note**: Ensure that you are working in the environment you created in step 1 to avoid affecting theprimary environment.

4. **Generate a migration**: After making changes in DatoCMS, generate a migration file using the command below. This will create a new migration file in the `migrations` directory that has all schema changes between the primary environment and the new one you created in step 1.
  ```shell
  npm run cms:migrations:create
  ```

5. **Review and commit the migration**: Check the generated migration file in the `migrations` directory. Ensure it accurately reflects the changes you made in DatoCMS. Once confirmed, commit the migration file to your version control system.

6. **Remove the environment**: After committing the migration, remove the environment you created in step 1. Note that you will lose all data in this environment. If you want to keep the data, you can rename the environment via the DatoCMS web interface.
  ```shell
  npm run cms:environments:destory
  ```

7. **Run migrations**: Use the command below to fork a new environment from the primary environment and run all migrations to verify that it will apply the changes correctly. A new environment will be created with the same name as specified in `datocmsEnvironment` in your `datocms-environment.ts` file.
  ```shell
  npm run cms:migrations:run
  ```


8. **Add data to the created environment**: If you need to add data to the new environment, you can do so using the DatoCMS web interface. If you kept the previous environment (and renamed it), you might also copy data from it to the new one.

9. **Promote environment**: Once you have verified that the migration works, the new environment is set up correctly, and your code changes have been incorporated into the  main branch, you can promote the environment to production.
  ```shell
  npm run cms:environments:promote
  ```
