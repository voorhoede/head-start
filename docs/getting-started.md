# Getting Started

**Head Start is a starterkit to easily bootstrap your next web project. Here's how to get started.**

## Prequisites

Head Start requires Node.js to be installed. See [/.nvmrc](../.nvmrc) for the correct version.

## Create a repository

- Create a project repository using [the Head Start repository template](https://github.com/new?owner=voorhoede&template_name=head-start&template_owner=voorhoede). You can use this link, or select 'Use template' on the repository page.
- Clone your new repository (`git clone`).
- Install the project dependencies (`npm install`).
- Create a `.env` file (`cp .env.example .env`).

```bash
git clone ...
cd ...
npm install
cp .env.example .env
```

- Set `HEAD_START_PREVIEW_SECRET` in your `.env` file to a secret value. You can think up your own value or use a [passphrase generator](https://bitwarden.com/password-generator/) to help you create a secret like 'wooing-uncured-backspace'.

```bash
# .env
HEAD_START_PREVIEW_SECRET=create-your-own
```

Before you can run your project locally, you need to set-up a DatoCMS project.

## Create a DatoCMS project

- [Signup](https://dashboard.datocms.com/signup) or [signin](https://dashboard.datocms.com/) to your DatoCMS account.
- [Create a new DatoCMS project](https://dashboard.datocms.com/personal-account/projects/browse/new) (select blank project).
- In your CMS, go to Project Settings > API tokens (`/project_settings/access_tokens`) and copy the tokens full-access API token (`DATOCMS_API_TOKEN`) and read-only API token (`DATOCMS_READONLY_API_TOKEN`) to your `.env` file (see below).

```bash
# .env
DATOCMS_READONLY_API_TOKEN=copy-read-only-token
DATOCMS_API_TOKEN=copy-full-access-token
```

> [!WARNING]
> Migrations in Head Start have an [outstanding issue](https://github.com/voorhoede/head-start/issues/62). For now, use 'Duplicate project' in the DatoCMS projects dashboard instead.

- Add all models and settings in to your new CMS by running our [migrations](../config/datocms/migrations/) in a new [environment](https://www.datocms.com/docs/scripting-migrations/introduction) called `start` using the DatoCMS CLI: `npx datocms migrations:run --destination=start --fast-fork`.
- Promote the new `start` environment to primary environment: `npx datocms environments:promote start` Alternatively you can go to Project Settings > Environments (`/project_settings/environments`) and 'Promote' the `start` environment to primary.
- In your CMS, you can now safely remove the original environment via Project Settings > Environments (`/project_settings/environments`).

```bash
npx datocms migrations:run --destination=start --fast-fork
npx datocms environments:promote start
```

- Update `datocms-environment` to the new environment:

```ts
// datocms-environment.ts:
export const datocmsEnvironment = 'start';
```

You can now run your project locally:

```bash
npm run dev
```

The next step is creating a Cloudflare Pages application so your project can be deployed to the cloud.

## Create a Cloudflare Pages application

- [Signup](https://dash.cloudflare.com/sign-up) or [login](https://dash.cloudflare.com/login) to your Cloudflare Dashboard.
- Go to Workers & Pages and hit 'Create application' and select 'Pages' (`/<your-cloudflare>/workers-and-pages/create/pages`).
- Connect to Git(Hub), select your repository and hit 'Begin setup'.
- Set 'Build command' to `npm run build`.
- Set 'Build output directory' to `dist/`.
- Under 'Environment variables' add the variables from your `.env` file.
- Hit 'Save and deploy'.

That's it. Your project is deployed and you're ready to turn it into something amazing!

## What's next?

Read the [docs](../README.md#documentation) for more details on the setup Head Start provides.
