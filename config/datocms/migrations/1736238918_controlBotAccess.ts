import type { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Boolean field "Allow AI Bots" (`allow_ai_bots`) in model "\uD83D\uDDA5\uFE0F Website" (`app`)'
  );
  await client.fields.create('Zrs1dDxCTXKDS0pdgh1yCw', {
    id: 'LMT_L4wOT2yMX7S3ZViZAw',
    label: 'Allow AI Bots',
    field_type: 'boolean',
    api_key: 'allow_ai_bots',
    hint: 'When you don\'t allow AI bots access, we\'ll signal AI platforms (like OpenAI) to not use your content for training their models or using it for AI search queries.',
    appearance: { addons: [], editor: 'boolean', parameters: {} },
    default_value: false,
  });
}
