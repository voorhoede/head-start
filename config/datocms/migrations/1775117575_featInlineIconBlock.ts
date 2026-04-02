import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Create new models/block models');

  console.log('Create block model "\uD83D\uDE98 Icon Block" (`icon_block`)');
  await client.itemTypes.create(
    {
      id: 'O3-JKIJwTaiqdryVNiyBBA',
      name: '\uD83D\uDE98 Icon Block',
      api_key: 'icon_block',
      modular_block: true,
      draft_saving_active: false,
      hint: '',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'PjIM78kJT3KeZii5Amr65Q',
    },
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "Name" (`name`) in block model "\uD83D\uDE98 Icon Block" (`icon_block`)',
  );
  await client.fields.create('O3-JKIJwTaiqdryVNiyBBA', {
    id: 'HSHkTh4fRsKlUHpdraaIIg',
    label: 'Name',
    field_type: 'string',
    api_key: 'name',
    validators: { required: {}, enum: { values: ['external', 'download'] } },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "\uD83D\uDE98 Icon Block" (`icon_block`)',
  );
  await client.fields.create('O3-JKIJwTaiqdryVNiyBBA', {
    id: 'YcplD7VvSKy7Rw7BGWeKIA',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    appearance: {
      addons: [],
      editor: 'EiyZ3d0SSDCPCNbsKBIwWQ',
      parameters: {
        editFunction: false,
        defaultFunction:
          'const iconName = thisBlock?.name || \'\';\nreturn iconName ? `\uD83D\uDE98 ${iconName}` : \'\uD83D\uDE98\';',
      },
      field_extension: 'computedFields',
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
          'Tv6MHewBS4evujN0EuSrwQ',
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
      structured_text_inline_blocks: { item_types: ['O3-JKIJwTaiqdryVNiyBBA'] },
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
          'Tv6MHewBS4evujN0EuSrwQ',
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
      structured_text_inline_blocks: {
        item_types: ['O3-JKIJwTaiqdryVNiyBBA', 'Yj11fFgoThKqLyKcqIg2Gg'],
      },
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

  console.log('Update block model "\uD83D\uDE98 Icon Block" (`icon_block`)');
  await client.itemTypes.update('O3-JKIJwTaiqdryVNiyBBA', {
    presentation_title_field: { id: 'YcplD7VvSKy7Rw7BGWeKIA', type: 'field' },
  });

  console.log('Manage schema menu items');

  console.log(
    'Update block schema menu item for block model "\uD83D\uDE98 Icon Block" (`icon_block`)',
  );
  await client.schemaMenuItems.update('PjIM78kJT3KeZii5Amr65Q', {
    position: 34,
  });
}
