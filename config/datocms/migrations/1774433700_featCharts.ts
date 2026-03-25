import type { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Manage upload filters');

  console.log('Delete plugin "Model Deployment Links"');
  await client.plugins.destroy('NYOCpCD9SUSA3y3sod-84Q');

  console.log('Create new models/block models');

  console.log('Create block model "\uD83D\uDCCA Chart Block" (`chart_block`)');
  await client.itemTypes.create(
    {
      id: 'R3_2clPMRL2CPB1Rf1229w',
      name: '\uD83D\uDCCA Chart Block',
      api_key: 'chart_block',
      modular_block: true,
      draft_saving_active: false,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'TgfyXBHHS5-Fk-XGBCJy0w',
    },
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "\uD83D\uDCCA Chart Block" (`chart_block`)',
  );
  await client.fields.create('R3_2clPMRL2CPB1Rf1229w', {
    id: 'b017pRYBT-CdgC4hNrLgwg',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Chart Type" (`chart_type`) in block model "\uD83D\uDCCA Chart Block" (`chart_block`)',
  );
  await client.fields.create('R3_2clPMRL2CPB1Rf1229w', {
    id: 'H1mdFx4jReG7IjrJbM7q-Q',
    label: 'Chart Type',
    field_type: 'string',
    api_key: 'chart_type',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'string_radio_group',
      parameters: {
        radios: [
          {
            hint: 'Use to show distribution of parts of a whole',
            label: 'Pie chart',
            value: 'pie',
          },
          { hint: '', label: 'Bar chart', value: 'bar' },
          { hint: '', label: 'Line chart', value: 'line' },
        ],
      },
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Chart Orientation" (`chart_orientation`) in block model "\uD83D\uDCCA Chart Block" (`chart_block`)',
  );
  await client.fields.create('R3_2clPMRL2CPB1Rf1229w', {
    id: 'DtyK51DKS96LWM3a0EMXgA',
    label: 'Chart Orientation',
    field_type: 'string',
    api_key: 'chart_orientation',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'string_radio_group',
      parameters: {
        radios: [
          {
            hint: 'Works better on mobile / small screens',
            label: 'Vertical',
            value: 'vertical',
          },
          { hint: '', label: 'Horizontal', value: 'horizontal' },
        ],
      },
    },
    default_value: 'vertical',
  });

  console.log(
    'Create Single-line string field "Order by" (`order_by`) in block model "\uD83D\uDCCA Chart Block" (`chart_block`)',
  );
  await client.fields.create('R3_2clPMRL2CPB1Rf1229w', {
    id: 'F-IAjyNcRPWYajEaV2PdbQ',
    label: 'Order by',
    field_type: 'string',
    api_key: 'order_by',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'string_radio_group',
      parameters: {
        radios: [
          {
            hint: 'Large to small, best for accessibility.',
            label: 'Size',
            value: 'size',
          },
          { hint: '', label: 'Alphabetical', value: 'alphabetical' },
          { hint: '', label: 'Source input', value: 'source' },
        ],
      },
    },
    default_value: null,
  });

  console.log(
    'Create JSON field "Data" (`data`) in block model "\uD83D\uDCCA Chart Block" (`chart_block`)',
  );
  await client.fields.create('R3_2clPMRL2CPB1Rf1229w', {
    id: 'bZIVFoIjTiWHy9qfXfktXQ',
    label: 'Data',
    field_type: 'json',
    api_key: 'data',
    hint: 'Use the first column for data entry names (for example "Fruit names"). Add a column to add a serie of values (for example number of fruits). The top row should contain the name of the serie (for example "Shop A", "Shop B").\n\nThe table will be available as part of the chart\'s caption for enhanced accessibility.',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'Af-zYKJRT5Wg8Y1Gt8SY3g',
      parameters: {},
      field_extension: 'table',
    },
    default_value: null,
  });

  console.log(
    'Create Structured text field "Text" (`text`) in block model "\uD83D\uDCCA Chart Block" (`chart_block`)',
  );
  await client.fields.create('R3_2clPMRL2CPB1Rf1229w', {
    id: 'TXTOI9vZRsq5t6F-im4WTA',
    label: 'Text',
    field_type: 'structured_text',
    api_key: 'text',
    hint: 'How would you describe (the essence) of this chart over the phone?',
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
        marks: ['emphasis', 'strong'],
        nodes: ['inlineItem', 'itemLink'],
        heading_levels: [],
        blocks_start_collapsed: false,
        show_links_meta_editor: false,
        show_links_target_blank: true,
      },
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Value Prefix" (`value_prefix`) in block model "\uD83D\uDCCA Chart Block" (`chart_block`)',
  );
  await client.fields.create('R3_2clPMRL2CPB1Rf1229w', {
    id: 'QS_T9GCbTWaC6I6hk0CWZQ',
    label: 'Value Prefix',
    field_type: 'string',
    api_key: 'value_prefix',
    hint: 'Displayed in front of every value. For example "\u20AC".',
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Value Suffix" (`value_suffix`) in block model "\uD83D\uDCCA Chart Block" (`chart_block`)',
  );
  await client.fields.create('R3_2clPMRL2CPB1Rf1229w', {
    id: 'FljAIDrfSaCwh1kWfV14Xw',
    label: 'Value Suffix',
    field_type: 'string',
    api_key: 'value_suffix',
    hint: 'Displayed after every value. For example "\u00B0C".',
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: null,
  });

  console.log(
    'Create Integer number field "Value Precision" (`value_precision`) in block model "\uD83D\uDCCA Chart Block" (`chart_block`)',
  );
  await client.fields.create('R3_2clPMRL2CPB1Rf1229w', {
    id: 'Ha0_Y3J3STuuRyYTOdr7Lg',
    label: 'Value Precision',
    field_type: 'integer',
    api_key: 'value_precision',
    validators: { number_range: { min: 0, max: 5 } },
    appearance: {
      addons: [],
      editor: 'integer',
      parameters: { placeholder: null },
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Theme" (`theme`) in block model "\uD83D\uDCCA Chart Block" (`chart_block`)',
  );
  await client.fields.create('R3_2clPMRL2CPB1Rf1229w', {
    id: 'X4E2P-a6RaSVghRVwLVL9g',
    label: 'Theme',
    field_type: 'string',
    api_key: 'theme',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'string_radio_group',
      parameters: {
        radios: [
          {
            hint: 'Distinct colours with alternating light and dark tint for high contrast ratio. Best for accessibility.',
            label: 'Categorical',
            value: 'categorical',
          },
          {
            hint: 'Stepped gradient colours to show sequential series (like age ranges 0-10, 11-20, etc).',
            label: 'Sequential',
            value: 'sequential',
          },
        ],
      },
    },
    default_value: 'categorical',
  });

  console.log('Destroy fields in existing models/block models');

  console.log(
    'Delete JSON field "Preview" (`preview`) in model "\uD83D\uDCD1 Page" (`page`)',
  );
  await client.fields.destroy('dyBTjn-aQwOI1xYPVvCFsQ');

  console.log(
    'Delete JSON field "Preview" (`preview`) in model "\uD83C\uDFE0 Home" (`home_page`)',
  );
  await client.fields.destroy('FbCSEwdTSEulvG2Jw70dyg');

  console.log(
    'Delete JSON field "Preview" (`preview`) in model "\uD83E\uDD37 Not found" (`not_found_page`)',
  );
  await client.fields.destroy('F861OXBNQE6s0QkW8Ccg4A');

  console.log('Update existing fields/fieldsets');

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
          'R3_2clPMRL2CPB1Rf1229w',
          'TBuD6qQOSDy6i9dM3T_XEA',
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
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
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
      structured_text_inline_blocks: { item_types: [] },
    },
  });

  console.log(
    'Update Single asset field "Video" (`video_asset`) in block model "\uD83C\uDFAC Video Block" (`video_block`)',
  );
  await client.fields.update('KdXhYelkQdaepb_wpK7yuw', { hint: null });

  console.log('Destroy models/block models');

  console.log(
    'Delete block model "\uD83D\uDD22 Counter Block" (`counter_block`)',
  );
  await client.itemTypes.destroy('Yj11fFgoThKqLyKcqIg2Gg', {
    skip_menu_items_deletion: true,
  });

  console.log('Finalize models/block models');

  console.log('Update block model "\uD83D\uDCCA Chart Block" (`chart_block`)');
  await client.itemTypes.update('R3_2clPMRL2CPB1Rf1229w', {
    presentation_title_field: { id: 'b017pRYBT-CdgC4hNrLgwg', type: 'field' },
  });

  console.log('Manage schema menu items');

  console.log(
    'Update block schema menu item for block model "\uD83D\uDCCA Chart Block" (`chart_block`)',
  );
  await client.schemaMenuItems.update('TgfyXBHHS5-Fk-XGBCJy0w', {
    position: 28,
  });

  console.log(
    'Update block schema menu item for block model "\uD83D\uDDC2\uFE0F Grouping Item" (`grouping_item`)',
  );
  await client.schemaMenuItems.update('HgENUoheQ_2DhBF6OFHfWg', {
    position: 27,
  });
}
