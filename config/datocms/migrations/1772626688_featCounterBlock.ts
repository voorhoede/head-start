import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Create new models/block models');

  console.log(
    'Create block model "\uD83D\uDD22 Counter Block" (`counter_block`)',
  );
  await client.itemTypes.create(
    {
      id: 'Yj11fFgoThKqLyKcqIg2Gg',
      name: '\uD83D\uDD22 Counter Block',
      api_key: 'counter_block',
      modular_block: true,
      draft_saving_active: false,
      hint: 'Counts the number from 0 up to the desired value',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'Na6SDsvBRfKgxKRmrCHnxA',
    },
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Floating-point number field "Value" (`value`) in block model "\uD83D\uDD22 Counter Block" (`counter_block`)',
  );
  await client.fields.create('Yj11fFgoThKqLyKcqIg2Gg', {
    id: 'bWLkWhktStaEM68eDL7Otg',
    label: 'Value',
    field_type: 'float',
    api_key: 'value',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'float',
      parameters: { placeholder: null },
    },
    default_value: null,
  });
}
