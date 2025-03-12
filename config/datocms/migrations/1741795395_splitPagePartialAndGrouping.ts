import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Create new models/block models');

  console.log(
    'Create block model "\uD83D\uDDC3\uFE0F Grouping Block" (`grouping_block`)',
  );
  await client.itemTypes.create(
    {
      id: 'TBuD6qQOSDy6i9dM3T_XEA',
      name: '\uD83D\uDDC3\uFE0F Grouping Block',
      api_key: 'grouping_block',
      modular_block: true,
      draft_saving_active: false,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'XZDLSGZcSvGjkpzdfymBrg',
    },
  );

  console.log(
    'Create block model "\uD83D\uDDC2\uFE0F Grouping Item Block" (`grouping_item_block`)',
  );
  await client.itemTypes.create(
    {
      id: 'BeM4dW2OQYWKc9iBZUyMeg',
      name: '\uD83D\uDDC2\uFE0F Grouping Item Block',
      api_key: 'grouping_item_block',
      modular_block: true,
      draft_saving_active: false,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'HgENUoheQ_2DhBF6OFHfWg',
    },
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "layout" (`layout`) in block model "\uD83D\uDDC3\uFE0F Grouping Block" (`grouping_block`)',
  );
  await client.fields.create('TBuD6qQOSDy6i9dM3T_XEA', {
    id: 'Wj5FlZbpRb23MFWVegBEoA',
    label: 'layout',
    field_type: 'string',
    api_key: 'layout',
    validators: {
      required: {},
      enum: {
        values: [
          'stack-untitled',
          'stack-titled',
          'accordion-closed',
          'accordion-open',
          'tabs',
        ],
      },
    },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: null,
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Items" (`items`) in block model "\uD83D\uDDC3\uFE0F Grouping Block" (`grouping_block`)',
  );
  await client.fields.create('TBuD6qQOSDy6i9dM3T_XEA', {
    id: 'ZEgzOa7HRnqDBc-FgI0RFQ',
    label: 'Items',
    field_type: 'rich_text',
    api_key: 'items',
    validators: {
      rich_text_blocks: { item_types: ['BeM4dW2OQYWKc9iBZUyMeg'] },
      size: { min: 1 },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "\uD83D\uDDC2\uFE0F Grouping Item Block" (`grouping_item_block`)',
  );
  await client.fields.create('BeM4dW2OQYWKc9iBZUyMeg', {
    id: 'SKH6LSKZS12ZmF10nklCXg',
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
    'Create Modular Content (Multiple blocks) field "Body" (`blocks`) in block model "\uD83D\uDDC2\uFE0F Grouping Item Block" (`grouping_item_block`)',
  );
  await client.fields.create('BeM4dW2OQYWKc9iBZUyMeg', {
    id: 'NTDc3vtCRzO5mEsE3gfmOQ',
    label: 'Body',
    field_type: 'rich_text',
    api_key: 'blocks',
    validators: {
      rich_text_blocks: {
        item_types: [
          'BRbU6VwTRgmG5SbwUs0rBg',
          'F60ZY1wFSW2qbvh99poj3g',
          'PAk40zGjQJCcDXXPgygUrA',
          'QYfZyBzIRWKxA1MinIR0aQ',
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
      size: { min: 1 },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  console.log(
    'Create Single link field "Partial" (`partial`) in block model "\uD83E\uDDE9 Page Partial Block" (`page_partial_block`)',
  );
  await client.fields.create('V80liDVtRC-UYgd3Sm-dXg', {
    id: 'fuBD9CrDRW2Qxngnit819w',
    label: 'Partial',
    field_type: 'link',
    api_key: 'partial',
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: ['DAdmJVaoTZKumF9GYBZDfQ'],
      },
      required: {},
    },
    appearance: { addons: [], editor: 'link_select', parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in model "\uD83E\uDDE9 Page Partial" (`page_partial`)',
  );
  await client.fields.create('DAdmJVaoTZKumF9GYBZDfQ', {
    id: 'NFSEo4lZQXed7rreAiKhGg',
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

  console.log('Destroy fields in existing models/block models');

  console.log(
    'Delete Multiple links field "Items" (`items`) in block model "\uD83E\uDDE9 Page Partial Block" (`page_partial_block`)',
  );
  await client.fields.destroy('UgwMgWgIRPS-nqcdJdQYIg');

  console.log(
    'Delete Single-line string field "Layout" (`layout`) in block model "\uD83E\uDDE9 Page Partial Block" (`page_partial_block`)',
  );
  await client.fields.destroy('SO4JBlc8QCiQjRNJVlZPcw');

  console.log(
    'Delete Single-line string field "Title" (`title`) in model "\uD83E\uDDE9 Page Partial" (`page_partial`)',
  );
  await client.fields.destroy('UFrvDLVxQju6Z35XHzuENQ');

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Single link field "Partial" (`partial`) in block model "\uD83E\uDDE9 Page Partial Block" (`page_partial_block`)',
  );
  await client.fields.update('fuBD9CrDRW2Qxngnit819w', { position: 1 });

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
    'Update Single-line string field "Title" (`title`) in model "\uD83E\uDDE9 Page Partial" (`page_partial`)',
  );
  await client.fields.update('NFSEo4lZQXed7rreAiKhGg', { position: 1 });

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
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
    },
  });

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`body_blocks`) in model "\uD83C\uDFE0 Home" (`home_page`)',
  );
  await client.fields.update('pUj2PObgTyC-8X4lvZLMBA', {
    validators: {
      rich_text_blocks: {
        item_types: [
          'BRbU6VwTRgmG5SbwUs0rBg',
          'F60ZY1wFSW2qbvh99poj3g',
          'PAk40zGjQJCcDXXPgygUrA',
          'QYfZyBzIRWKxA1MinIR0aQ',
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

  console.log('Finalize models/block models');

  console.log(
    'Update block model "\uD83D\uDDC3\uFE0F Grouping Block" (`grouping_block`)',
  );
  await client.itemTypes.update('TBuD6qQOSDy6i9dM3T_XEA', {
    presentation_title_field: { id: 'Wj5FlZbpRb23MFWVegBEoA', type: 'field' },
  });

  console.log(
    'Update block model "\uD83D\uDDC2\uFE0F Grouping Item Block" (`grouping_item_block`)',
  );
  await client.itemTypes.update('BeM4dW2OQYWKc9iBZUyMeg', {
    presentation_title_field: { id: 'SKH6LSKZS12ZmF10nklCXg', type: 'field' },
  });

  console.log('Update model "\uD83E\uDDE9 Page Partial" (`page_partial`)');
  await client.itemTypes.update('DAdmJVaoTZKumF9GYBZDfQ', {
    name: '\uD83E\uDDE9 Page Partial',
    presentation_title_field: { id: 'NFSEo4lZQXed7rreAiKhGg', type: 'field' },
    title_field: { id: 'NFSEo4lZQXed7rreAiKhGg', type: 'field' },
  });

  console.log('Manage schema menu items');

  console.log(
    'Update block schema menu item for block model "\uD83D\uDDC2\uFE0F Grouping Item Block" (`grouping_item_block`)',
  );
  await client.schemaMenuItems.update('HgENUoheQ_2DhBF6OFHfWg', {
    position: 27,
  });
}
