import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Create new models/block models');

  console.log('Create block model "\uD83D\uDD22 List item" (`list_item`)');
  await client.itemTypes.create(
    {
      id: 'C7XXNAAxQUqrKViywb05eA',
      name: '\uD83D\uDD22 List item',
      api_key: 'list_item',
      modular_block: true,
      draft_saving_active: false,
      hint: '',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'Fl0kHHWET4OKn7VHCvWAXg',
    },
  );

  console.log('Create block model "\uD83D\uDD22 List Block" (`list_block`)');
  await client.itemTypes.create(
    {
      id: 'Tv6MHewBS4evujN0EuSrwQ',
      name: '\uD83D\uDD22 List Block',
      api_key: 'list_block',
      modular_block: true,
      draft_saving_active: false,
      hint: '',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'Y4iMMvsiQRGLhJc9lPVFew',
    },
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Structured text field "Text" (`text`) in block model "\uD83D\uDD22 List item" (`list_item`)',
  );
  await client.fields.create('C7XXNAAxQUqrKViywb05eA', {
    id: 'bvdh6Cu8QJu-uYTyxi4_CA',
    label: 'Text',
    field_type: 'structured_text',
    api_key: 'text',
    validators: {
      required: {},
      structured_text_blocks: { item_types: [] },
      structured_text_inline_blocks: { item_types: [] },
      structured_text_links: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: [],
      },
    },
    appearance: {
      addons: [],
      editor: 'structured_text',
      parameters: {
        marks: ['emphasis', 'strong', 'underline'],
        nodes: ['inlineItem', 'itemLink', 'link'],
        heading_levels: [1, 2, 3, 4, 5, 6],
        blocks_start_collapsed: false,
        show_links_meta_editor: false,
        show_links_target_blank: true,
      },
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Type" (`list_type`) in block model "\uD83D\uDD22 List Block" (`list_block`)',
  );
  await client.fields.create('Tv6MHewBS4evujN0EuSrwQ', {
    id: 'BIOGSwNaQkO0mxCay1AJ8g',
    label: 'Type',
    field_type: 'string',
    api_key: 'list_type',
    validators: { required: {}, enum: { values: ['ordered', 'unordered'] } },
    appearance: {
      addons: [
        {
          id: 'Srdwo4YOREmRtvMAV2otlQ',
          parameters: {
            dependencies: '{\n  "ordered": [\n    "start_number"\n  ]\n}',
          },
        },
      ],
      editor: 'string_select',
      parameters: {
        options: [
          { hint: '', label: 'Ordered', value: 'ordered' },
          { hint: '', label: 'Unordered', value: 'unordered' },
        ],
      },
    },
    default_value: 'ordered',
  });

  console.log(
    'Create Integer number field "Start number" (`start_number`) in block model "\uD83D\uDD22 List Block" (`list_block`)',
  );
  await client.fields.create('Tv6MHewBS4evujN0EuSrwQ', {
    id: 'anamS4ZQRDCZXvXPBtkmxg',
    label: 'Start number',
    field_type: 'integer',
    api_key: 'start_number',
    appearance: {
      addons: [],
      editor: 'integer',
      parameters: { placeholder: null },
    },
    default_value: 1,
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Items" (`items`) in block model "\uD83D\uDD22 List Block" (`list_block`)',
  );
  await client.fields.create('Tv6MHewBS4evujN0EuSrwQ', {
    id: 'R30BMoA3TqqCkFXVCWNojw',
    label: 'Items',
    field_type: 'rich_text',
    api_key: 'items',
    validators: {
      rich_text_blocks: { item_types: ['C7XXNAAxQUqrKViywb05eA'] },
      size: { min: 1 },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: false },
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
      structured_text_inline_blocks: { item_types: [] },
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

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`blocks`) in model "\uD83E\uDDE9 Page Partial" (`page_partial`)',
  );
  await client.fields.update('SKLmdv71Rge0rKhJzOFQWQ', {
    validators: {
      rich_text_blocks: {
        item_types: [
          'BRbU6VwTRgmG5SbwUs0rBg',
          'F60ZY1wFSW2qbvh99poj3g',
          'PAk40zGjQJCcDXXPgygUrA',
          'QYfZyBzIRWKxA1MinIR0aQ',
          'TBuD6qQOSDy6i9dM3T_XEA',
          'Tv6MHewBS4evujN0EuSrwQ',
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
    },
  });

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`body_blocks`) in model "\uD83D\uDCD1 Page" (`page`)',
  );
  await client.fields.update('Q-z1nyMsQtC8Sr6w6J2oGw', {
    validators: {
      rich_text_blocks: {
        item_types: [
          'BRbU6VwTRgmG5SbwUs0rBg',
          'F60ZY1wFSW2qbvh99poj3g',
          'PAk40zGjQJCcDXXPgygUrA',
          'QYfZyBzIRWKxA1MinIR0aQ',
          'TBuD6qQOSDy6i9dM3T_XEA',
          'Tv6MHewBS4evujN0EuSrwQ',
          'VZvVfu52RZK81WG0Dxp-FQ',
          'V80liDVtRC-UYgd3Sm-dXg',
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
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

  console.log('Finalize models/block models');

  console.log('Update block model "\uD83D\uDD22 List Block" (`list_block`)');
  await client.itemTypes.update('Tv6MHewBS4evujN0EuSrwQ', {
    presentation_title_field: { id: 'BIOGSwNaQkO0mxCay1AJ8g', type: 'field' },
  });
}
