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

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Structured text field "Text" (`text`) in block model "\uD83D\uDCDD Text Block" (`text_block`)',
  );
  await client.fields.update('NtVXfZ6gTL2sKNffNeUf5Q', {
    validators: {
      required: {},
      structured_text_blocks: {
        item_types: [
          'F60ZY1wFSW2qbvh99poj3g',
          'QYfZyBzIRWKxA1MinIR0aQ',
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
      structured_text_inline_blocks: { item_types: ['Yj11fFgoThKqLyKcqIg2Gg'] },
      structured_text_links: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: [
          'GjWw8t-hTFaYYWyc53FeIg',
          'LjXdkuCdQxCFT4hv8_ayew',
          'X_tZn3TxQY28ltSyjZUGHQ',
        ],
      },
    },
  });
}
