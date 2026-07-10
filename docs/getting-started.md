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

## Enable AI Search

Head Start has an optional AI Search prototype that lets visitors ask natural-language questions about your site's content. It uses [Cloudflare AI Search](https://developers.cloudflare.com/ai-search/) to index your published pages (via the existing `/api/content/<path>.md` endpoint) and answer questions with citations. Two endpoints share the same setup:

- `/api/ai-search` for a single question + answer.
- `/api/ai-chat` for multi-turn follow-ups. Accepts `{ messages: [{ role: 'user' | 'assistant', content }, ...] }`; the server caps history to the last 10 messages.

If you skip this section, builds and deploys still work. The endpoints just return a 503.

### 1. Create an AI Search instance

- In the [Cloudflare dashboard](https://dash.cloudflare.com/), go to **AI** > **AI Search** and create a new instance with built-in storage.
- Under the instance's **Settings** > **Metadata fields**, declare four custom metadata fields (all of type `text`): `url`, `title`, `description`, `language`. These must exist before the indexer can upload pages.
- Copy the instance name.

### 2. Create a KV namespace for the indexer cache

The indexer stores a fingerprint per page in [Workers KV](https://developers.cloudflare.com/kv/) so it can skip unchanged pages on re-runs (no wasted embedding calls).

- In the Cloudflare dashboard, go to **Storage & Databases** > **KV** and create a new namespace (any name works, e.g. `AI_SEARCH_HASHES`).
- Copy the namespace ID.

### 3. Create an API token

- Go to **My Profile** > **API Tokens** > **Create Token** > **Create Custom Token**.
- Add three permissions:
  - **Account** > **AI Search:Edit**
  - **Account** > **AI Search:Run**
  - **Account** > **Workers KV Storage:Edit**
- Copy the token value.

### 4. Add the values to your `.env`

```shell
# .env
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-token
CLOUDFLARE_AI_SEARCH_INSTANCE_NAME=your-instance-name
CLOUDFLARE_AI_SEARCH_KV_NAMESPACE_ID=your-kv-namespace-id
SITE_URL=https://your-project.pages.dev
```

`SITE_URL` is the deployed site the indexer crawls. Set it to your production URL. The GitHub workflow sets it automatically from the production deploy, so it's only needed in your local `.env`.

### 5. Add Cloudflare Pages environment variables

So the `/api/ai-search` proxy can reach AI Search at runtime, add these in your Pages project > **Settings** > **Environment variables** (production + preview):

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_AI_SEARCH_INSTANCE_NAME`

The KV namespace ID is only needed by the indexer, not the runtime proxy, so it doesn't go on Pages. The runtime proxy doesn't need `Workers KV Storage:Edit` either, but it's harmless to leave on the token.

### 6. Add GitHub repository secrets for automatic re-indexing

Head Start ships a [GitHub Actions workflow](../.github/workflows/index-ai-search.yml) that runs the indexer after every successful Cloudflare Pages production deploy. This is what keeps the AI Search index in sync with what's live, including the very first index after you push your code. The workflow listens for the `deployment_status` event and only fires on the `Production` environment, so preview deploys are ignored.

To enable it, add these four repository secrets in **Settings** > **Secrets and variables** > **Actions**:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_AI_SEARCH_INSTANCE_NAME`
- `CLOUDFLARE_AI_SEARCH_KV_NAMESPACE_ID`

Once these are set, you can push your code and the first production deploy will index your pages automatically. No manual command needed.

### 7. (Optional) Verify your indexer setup locally

If you want to confirm your `.env` is correct before pushing (or seed the index immediately without waiting for a deploy), run the indexer once locally:

```shell
npm run index:ai-search
```

This crawls the sitemap at the `SITE_URL` you set in step 4.

On a fresh KV namespace, expect a log line per page (`added:`) and a summary like `Done. +N added, ~0 updated, =0 unchanged, !M skipped, -0 pruned.` Run it a second time. Every page should now log `unchanged:`, confirming the cache works.

### Cleaning up deleted pages

When a page is removed from your site, the next indexer run notices that its URL is no longer in the sitemap and logs it as stale. By design, the workflow does not delete stale entries automatically. A misconfigured sitemap (for example, a CMS API hiccup that returns only a handful of URLs) would otherwise silently wipe most of your index.

To actually delete orphaned entries, run the indexer manually with the prune flag:

```shell
AI_SEARCH_PRUNE_STALE=1 npm run index:ai-search
```

This is an occasional housekeeping command, not something you need to schedule.

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
