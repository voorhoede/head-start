import type { Client, SimpleSchemaTypes } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Boolean field "Has header row?" (`has_header_row`) in block model "Table Block" (`table_block`)'
  );
  newFields['C4TKf4ifQ_S1QQK87nc9uw'] = await client.fields.create(
    '0SxYNS2CR1it_5LHYWuEQg',
    {
      label: 'Has header row?',
      field_type: 'boolean',
      api_key: 'has_header_row',
      hint: 'The header row in the table above always needs unique values as these are used to identify the column values. Even if the table displayed on the page should not have a header row.',
      appearance: { addons: [], editor: 'boolean', parameters: {} },
      default_value: true,
    }
  );

  console.log(
    'Create Boolean field "Has header column?" (`has_header_column`) in block model "Table Block" (`table_block`)'
  );
  newFields['D2OLeqrZSBCbaxjC7ci1ng'] = await client.fields.create(
    '0SxYNS2CR1it_5LHYWuEQg',
    {
      label: 'Has header column?',
      field_type: 'boolean',
      api_key: 'has_header_column',
      hint: 'If the switch is turned on, the first value in each row is used to describe the following values in that row.',
      appearance: { addons: [], editor: 'boolean', parameters: {} },
      default_value: null,
    }
  );
}
