import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Boolean field "Has Table of Contents" (`has_table_of_contents`) in model "\uD83D\uDCD1 Page" (`page`)',
  );
  await client.fields.create('LjXdkuCdQxCFT4hv8_ayew', {
    id: 'O1GwGpnqTO2dtee2OIhKyQ',
    label: 'Has Table of Contents',
    field_type: 'boolean',
    api_key: 'has_table_of_contents',
    hint: 'If set, a table of contents with anchor links to the page headings will be shown above the page content.',
    appearance: { addons: [], editor: 'boolean', parameters: {} },
    default_value: null,
  });

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Boolean field "Has Table of Contents" (`has_table_of_contents`) in model "\uD83D\uDCD1 Page" (`page`)',
  );
  await client.fields.update('O1GwGpnqTO2dtee2OIhKyQ', { position: 5 });
}
