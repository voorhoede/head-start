import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Create new models/block models');

  console.log('Create model "\uD83D\uDD23 Variables" (`variable`)');
  await client.itemTypes.create(
    {
      id: 'Weqp1brXRkSS-jZE8Z3HTw',
      name: '\uD83D\uDD23 Variables',
      api_key: 'variable',
      draft_mode_active: false,
      draft_saving_active: false,
      collection_appearance: 'table',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'eEZ8k--GSZ2mI4oTffj3YA',
    },
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "Title" (`title`) in model "\uD83D\uDD23 Variables" (`variable`)',
  );
  await client.fields.create('Weqp1brXRkSS-jZE8Z3HTw', {
    id: 'ILVOGJzmTpKPVHzRuNUhnA',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Value" (`value`) in model "\uD83D\uDD23 Variables" (`variable`)',
  );
  await client.fields.create('Weqp1brXRkSS-jZE8Z3HTw', {
    id: 'DihXGTqXQoia4qtLLVmuQA',
    label: 'Value',
    field_type: 'string',
    api_key: 'value',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: null,
  });

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Structured text field "Text" (`text`) in block model "\uD83D\uDCDD \uD83D\uDDBC\uFE0F Text Image Block" (`text_image_block`)',
  );
  await client.fields.update('V4dMfrWsQ027JYEp6q3KhA', {
    validators: {
      required: {},
      structured_text_blocks: {
        item_types: [
          'F60ZY1wFSW2qbvh99poj3g',
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
      structured_text_inline_blocks: { item_types: [] },
      structured_text_links: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: [
          'GjWw8t-hTFaYYWyc53FeIg',
          'LjXdkuCdQxCFT4hv8_ayew',
          'Weqp1brXRkSS-jZE8Z3HTw',
          'X_tZn3TxQY28ltSyjZUGHQ',
        ],
      },
    },
  });

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
          'Weqp1brXRkSS-jZE8Z3HTw',
          'X_tZn3TxQY28ltSyjZUGHQ',
        ],
      },
    },
  });

  console.log('Finalize models/block models');

  console.log('Update model "\uD83D\uDD23 Variables" (`variable`)');
  await client.itemTypes.update('Weqp1brXRkSS-jZE8Z3HTw', {
    presentation_title_field: { id: 'ILVOGJzmTpKPVHzRuNUhnA', type: 'field' },
    title_field: { id: 'ILVOGJzmTpKPVHzRuNUhnA', type: 'field' },
  });

  console.log('Manage menu items');

  console.log('Create menu item "\uD83D\uDD23 Variables"');
  await client.menuItems.create({
    id: 'WihwQIF2TrSA8LDraeRnRA',
    label: '\uD83D\uDD23 Variables',
    item_type: { id: 'Weqp1brXRkSS-jZE8Z3HTw', type: 'item_type' },
  });
}