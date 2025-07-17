# Getting Started

**Head Start is a starterkit to easily bootstrap your next web project. Here's how to get started.**

## Prequisites

Head Start requires Node.js to be installed. See [/.nvmrc](../.nvmrc) for the correct version.

## Create a repository

- Create a project repository using [the Head Start repository template](https://github.com/new?owner=voorhoede&template_name=head-start&template_owner=voorhoede). You can use this link, or select 'Use template' on the repository page.
- Clone your new repository (`git clone`).
- Install the project dependencies (`npm install`).
- Create a `.env` file (`cp .env.example .env`).

```shell
git clone ...
cd ...
npm install
cp .env.example .env
```

- Set `HEAD_START_PREVIEW_SECRET` in your `.env` file to a secret value. You can think up your own value or use a [passphrase generator](https://bitwarden.com/password-generator/) to help you create a secret like 'wooing-uncured-backspace'.

```shell
# .env
HEAD_START_PREVIEW_SECRET=create-your-own
```

Before you can run your project locally, you need to set-up a DatoCMS project.

## Create a DatoCMS project
1. Signin to DatoCMS 
- [Signup](https://dashboard.datocms.com/signup) or [signin](https://dashboard.datocms.com/) to your DatoCMS account.

2. Create a new DatoCMS project.
- From your dashboard, create a new blank project

3. Generate API tokens
You'll need two tokens: one read-only and one with full access.
- In your CMS, go to Project Settings > API tokens (`/project_settings/access_tokens`) 
- Copy the existing **Read-only API Token** and add it to your .env file as:
```shell
# .env
DATOCMS_READONLY_API_TOKEN=your-readonly-token
```
- click 'Add a new API Token' (`/project_settings/access_tokens/new`) and create a new API token with:
  - **Role**: admin
  - **Permissions**: Enable All Access to APIs
  Add this token to your .env file as
```shell
# .env
DATOCMS_API_TOKEN=your-full-access-token
```

- Add all models and settings in to your new CMS by running our [migrations](../config/datocms/migrations/) in a new [environment](https://www.datocms.com/docs/scripting-migrations/introduction) `npm run cms:environments:create`.
  - When asked if you want to run all migrations, select 'Yes'.
- Once created, promote your new environment to primary `npm run cms:environments:promote`. 
  - You can safely delete the old primary environment when prompted
  - Alternatively you can go to Project Settings > Environments (`/project_settings/environments`) and 'Promote' your new environment to primary.

```shell
npm run cms:environments:create
npm run cms:environments:promote
```

> [!WARNING]
> Head Start has an open [issue on providing seed scripts](https://github.com/voorhoede/head-start/issues/27). You will manually add a bit of required (placeholder) content to your new CMS instance for the global SEO data, Home and 404 Page.

You can now run your project locally:

```shell
npm run dev
```

### Add DatoCMS secrets to repository

Head Start provides GitHub Actions which include linting code and validating HTML on PR changes. These Actions require the DatoCMS tokens to be available.

Go to your repository's Settings > Secrets and Variables > Actions > Repository Secrets (`/settings/secrets/actions#repository-secrets`) add `DATOCMS_API_TOKEN` and `DATOCMS_READONLY_API_TOKEN`.

Your PR's will now be able to run the pre-configured GitHub Actions.

The next step is creating a Cloudflare Pages application so your project can be deployed to the cloud.

## Add mandatory content to your DatoCMS project

- Go to your DatoCMS project > Content (`/environments/start/editor/settings`)
- Add the required items for the `SEO` and `Social Card`.
**If the above items are not set, your page will not be able to build**

## Create a Cloudflare Pages application

- [Signup](https://dash.cloudflare.com/sign-up) or [login](https://dash.cloudflare.com/login) to your Cloudflare Dashboard.
- Go to Workers & Pages and hit 'Create application' and select 'Pages' (`/<your-cloudflare>/workers-and-pages/create/pages`).
- Connect to Git(Hub), select your repository and hit 'Begin setup'.
- Set 'Build command' to `npm run cloudflare:build`.
- Set 'Build output directory' to `dist/`.
- Under 'Environment variables' add the variables from your `.env` file.
- Hit 'Save and deploy'.

You're project is now deployed and will automatically be deployed on every git commit. To ensure changes in the CMS also redeploy the project, we need to connect DatoCMS to Cloudflare.

## Connect DatoCMS to Cloudflare Pages

- Go to your Cloudflare Pages application > Settings > Builds & deployments and hit '[Add deploy hook](https://developers.cloudflare.com/pages/configuration/deploy-hooks/)'.
- Name the deploy hook "DatoCMS - Production" and set the branch to `main`.
- Copy the deploy hook URL.
- Go to your DatoCMS project > Project settings > Build triggers (`/project_settings/build_triggers/`) and hit 'Add new build triggers'.
- Select 'Custom webook'.
- Set 'build trigger name' to "Production".
- Set 'Website frontend URL' to your production domain (like `https://<project-name>.pages.dev/` or a custom domain).
- Enable site search.
- Paste the deploy hook under 'Trigger URL'.
- Set 'JSON payload' to `{ "branch": "main" }`.
- Hit 'Save settings'.
- Copy the build trigger ID from the page URL `/project_settings/build_triggers/<id>/edit` (like `30535`).
- Open `/datocms-environment.ts` and set the `buildTriggerId` there, to connect the search functionality to the indexed deployment.

That's it. Now deployments are automatically triggered from both git and when editors hit 'Build now' in the CMS. If you add additional build triggers in the future, you can repeat those steps. Note that `buildTriggerId` in `/datocms-environment.ts` should always be set to the production build trigger.

## What's next?

Read the [docs](../README.md#documentation) for more details on the setup Head Start provides.
