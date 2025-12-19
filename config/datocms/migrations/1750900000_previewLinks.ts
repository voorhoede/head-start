import type { Client } from '@datocms/cli/lib/cma-client-node';
import { createPreviewToken } from '../lib/createPreviewToken';

export default async function (client: Client) {
  console.log('Manage upload filters');

  console.log('Install plugin "Model Deployment Links"');
  const previewApiToken = await createPreviewToken(client);
  
  // Check if plugin already exists
  const existingPlugins = await client.plugins.list();
  let plugin = existingPlugins.find((p) => p.package_name === 'datocms-plugin-model-deployment-links');
  
  if (!plugin) {
    plugin = await client.plugins.create({
      package_name: 'datocms-plugin-model-deployment-links',
    });
  }
  
  await client.plugins.update(plugin.id, {
    parameters: { datoApiToken: previewApiToken.token },
  });

  console.log('Creating new fields/fieldsets');

  const page = await client.itemTypes.find('page');
  const homePage = await client.itemTypes.find('home_page');
  const notFoundPage = await client.itemTypes.find('not_found_page');

  console.log(
    'Create JSON field "Preview" (`preview`) in model "\uD83D\uDCD1 Page" (`page`)'
  );
  await client.fields.create(page.id, {
    label: 'Preview',
    field_type: 'json',
    api_key: 'preview',
    localized: true,
    appearance: {
      addons: [],
      editor: plugin.id,
      parameters: { urlPattern: '/api/reroute/page?locale={ locale }&slug={ slug }' },
    },
  });

  console.log(
    'Create JSON field "Preview" (`preview`) in model "\uD83C\uDFE0 Home" (`home_page`)'
  );
  await client.fields.create(homePage.id, {
    label: 'Preview',
    field_type: 'json',
    api_key: 'preview',
    localized: true,
    appearance: {
      addons: [],
      editor: plugin.id,
      parameters: { urlPattern: '/{ locale }/' },
    },
  });

  console.log(
    'Create JSON field "Preview" (`preview`) in model "\uD83E\uDD37 Not found" (`not_found_page`)'
  );
  await client.fields.create(notFoundPage.id, {
    label: 'Preview',
    field_type: 'json',
    api_key: 'preview',
    localized: true,
    appearance: {
      addons: [],
      editor: plugin.id,
      parameters: { urlPattern: '/{ locale }/404' },
    },
  });
}
