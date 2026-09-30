# Getting Started

**Head Start is a starterkit to easily bootstrap your next web project. Here's how to get started.**

## Prequisites

Head Start requires Node.js to be installed. See [.node-version](../.node-version) for the correct version.

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

### Configure DatoCMS plugins

Head Start comes with a few DatoCMS plugins pre-installed. The [Model Deployment Links plugin](https://www.datocms.com/marketplace/plugins/i/datocms-plugin-model-deployment-links) is configured automatically when running migrations. It adds preview links to the CMS sidebar so editors can preview pages directly from the CMS.

If you need to configure the plugin manually (e.g. when not using migrations):

- In your DatoCMS instance go to Project Settings > API Tokens (`/project_settings/access_tokens`) and "Add a new access token". Name it "Preview" (or whatever you prefer), for the "Role associated with this API token" select "Editor" and keep the other settings as is.
- Go to Environment Configuration > Plugins > Model Deployment Links and enter the newly created access token in the plugin settings under "DatoCMS API Token".

### Add DatoCMS secrets to repository

Head Start provides GitHub Actions which include linting code and validating HTML on PR changes. These Actions require the DatoCMS tokens to be available.

Go to your repository's Settings > Secrets and Variables > Actions > Repository Secrets (`/settings/secrets/actions#repository-secrets`) add `DATOCMS_API_TOKEN` and `DATOCMS_READONLY_API_TOKEN`.

Your PR's will now be able to run the pre-configured GitHub Actions.

The next step is deploying your project to Bunny.net.

## Add mandatory content to your DatoCMS project

- Go to your DatoCMS project > Content (`/environments/start/editor/settings`)
- Add the required items for the `SEO` and `Social Card`.
**If the above items are not set, your page will not be able to build**

## Deploy to Bunny.net

Head Start deploys with the [deploy workflow](../.github/workflows/deploy.yml), which runs [bunny-edge-deploy](https://github.com/voorhoede/bunny-edge-deploy) after `npm run build`.

- Create a [bunny.net](https://bunny.net/) account and copy its account API key from the dashboard.
- Go to your repository's Settings > Secrets and Variables > Actions > Repository Secrets and add `BUNNY_API_KEY` and `HEAD_START_PREVIEW_SECRET`, next to the DatoCMS tokens.
- Set the branches that deploy under `on.push.branches` in the deploy workflow.
- Push to one of those branches, or run the workflow by hand from the Actions tab.

The first run creates a storage zone, an Edge Script and a pull zone, all named after your repository, and the site is live at `https://<repository-name>.b-cdn.net`. Set `productionUrl` in [`astro.config.ts`](../astro.config.ts) to that address, or to your custom domain once you have added it to the pull zone in the Bunny dashboard.

Rebuilding when editors publish in DatoCMS is not wired up for Bunny yet.

## Connect DatoCMS site search

- Go to your DatoCMS project > Project settings > Build triggers (`/project_settings/build_triggers/`) and hit 'Add new build triggers'.
- Select 'Custom webook'.
- Set 'build trigger name' to "Production".
- Set 'Website frontend URL' to your production domain (like `https://<repository-name>.b-cdn.net/` or a custom domain).
- Enable site search.
- Set 'JSON payload' to `{ "branch": "main" }`.
- Hit 'Save settings'.
- Copy the build trigger ID from the page URL `/project_settings/build_triggers/<id>/edit` (like `30535`).
- Open `/datocms-environment.ts` and set the `buildTriggerId` there, to connect the search functionality to the indexed deployment.

The deploy workflow reports each deploy's result to the build trigger whose payload `branch` matches the deployed branch. Note that `buildTriggerId` in `/datocms-environment.ts` should always be set to the production build trigger.

## Enable AI agent discovery (DNS-AID) (optional)

Head Start serves an agent registry at [`/.well-known/agents/index.json`](../src/pages/.well-known/agents/index.json.ts) (see [SEO → Agent discovery](./seo.md#agent-discovery-dns-aid)). To make it discoverable via [DNS for AI Discovery (DNS-AID)](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/), add DNS records on your own domain. This is optional and only applies once you use a custom domain on Cloudflare.

1. **Publish DNS records.** In your Cloudflare DNS settings, add [`SVCB`/`HTTPS`](https://www.rfc-editor.org/rfc/rfc9460) records under `_agents.<domain>`. The `_index._agents.<domain>` record points clients to where the registry is served; service-specific records (e.g. `_a2a._agents.<domain>`) point to individual agents:

   ```dns
   _index._agents.example.com.  3600 IN SVCB 1 example.com. alpn="h2" port=443
   _a2a._agents.example.com.    3600 IN SVCB 1 agent.example.com. alpn="a2a" port=443 mandatory=alpn,port
   ```

   Point the `_index` record's target (and `well-known` path, if used) at your site, so `_index._agents.<domain>` resolves to `/.well-known/agents/index.json`.

2. **Enable DNSSEC.** Sign the zone so validating resolvers return authenticated data. On Cloudflare this is a [one-click setting](https://developers.cloudflare.com/dns/dnssec/) under DNS → Settings. This is the part a DNS-AID/DNSSEC audit checks — it cannot be set in application code.

## What's next?

Read the [docs](../README.md#documentation) for more details on the setup Head Start provides.
