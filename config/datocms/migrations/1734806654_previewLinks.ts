import type { Client } from '@datocms/cli/lib/cma-client-node';
import { createPreviewToken } from '../lib/createPreviewToken';

export default async function (client: Client) {
  console.log('Manage upload filters');

  console.log('Install plugin "Model Deployment Links"');
  const previewApiToken = await createPreviewToken(client);
  await client.plugins.create({
    id: 'MKba9NT5QBKZaeI4HcERwA',
    package_name: 'datocms-plugin-model-deployment-links',
  });
  await client.plugins.update('MKba9NT5QBKZaeI4HcERwA', {
    parameters: { datoApiToken: previewApiToken.token },
  });

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create JSON field "Preview" (`preview`) in model "\uD83D\uDCD1 Page" (`page`)'
  );
  await client.fields.create('LjXdkuCdQxCFT4hv8_ayew', {
    id: 'XF2LuFVWSrmu7Lle8xlhTg',
    label: 'Preview',
    field_type: 'json',
    api_key: 'preview',
    localized: true,
    appearance: {
      addons: [],
      editor: 'MKba9NT5QBKZaeI4HcERwA',
      parameters: { urlPattern: '/api/reroute/page?locale={ locale }&slug={ slug }' },
    },
  });

  console.log(
    'Create JSON field "Preview" (`preview`) in model "\uD83C\uDFE0 Home" (`home_page`)'
  );
  await client.fields.create('X_tZn3TxQY28ltSyjZUGHQ', {
    id: 'YPXZOMoWRdKTHLUkN9ytfw',
    label: 'Preview',
    field_type: 'json',
    api_key: 'preview',
    localized: true,
    appearance: {
      addons: [],
      editor: 'MKba9NT5QBKZaeI4HcERwA',
      parameters: { urlPattern: '/{ locale }/' },
    },
  });

  console.log(
    'Create JSON field "Preview" (`preview`) in model "\uD83E\uDD37 Not found" (`not_found_page`)'
  );
  await client.fields.create('d_AvMVoMSqmNbMqx-NdqIw', {
    id: 'O_DCfpaDSzq1MX4DaRlMpQ',
    label: 'Preview',
    field_type: 'json',
    api_key: 'preview',
    localized: true,
    appearance: {
      addons: [],
      editor: 'MKba9NT5QBKZaeI4HcERwA',
      parameters: { urlPattern: '/{ locale }/404' },
    },
  });
}
