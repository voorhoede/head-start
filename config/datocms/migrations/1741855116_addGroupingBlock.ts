import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  
  //@ts-expect-error rich_text_blocks is only available on Modular Content fields
  const homeBodyBlocks = (await client.fields.find('home_page::body_blocks')).validators.rich_text_blocks?.item_types;
  //@ts-expect-error rich_text_blocks is only available on Modular Content fields
  const pageBodyBlocks = (await client.fields.find('page::body_blocks')).validators.rich_text_blocks?.item_types;
  //@ts-expect-error rich_text_blocks is only available on Modular Content fields
  const pagePartialBlocks = (await client.fields.find('page_partial::blocks')).validators.rich_text_blocks?.item_types;
  
  console.log('Create new models/block models');

  console.log(
    'Create block model "\uD83D\uDDC3\uFE0F Grouping Block" (`grouping_block`)',
  );
  const groupingBlock = await client.itemTypes.create(
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
    'Create block model "\uD83D\uDDC2\uFE0F Grouping Item" (`grouping_item`)',
  );
  const groupingItem = await client.itemTypes.create(
    {
      id: 'BeM4dW2OQYWKc9iBZUyMeg',
      name: '\uD83D\uDDC2\uFE0F Grouping Item',
      api_key: 'grouping_item',
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
    'Create Single-line string field "Layout" (`layout`) in block model "\uD83D\uDDC3\uFE0F Grouping Block" (`grouping_block`)',
  );
  await client.fields.create(groupingBlock.id, {
    id: 'Wj5FlZbpRb23MFWVegBEoA',
    label: 'Layout',
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
      editor: 'string_radio_group',
      parameters: {
        radios: [
          {
            hint:
              'Show items, one after the other, without displaying their title.',
            label: 'Stack, untitled',
            value: 'stack-untitled',
          },
          {
            hint:
              'Show items, one after the other, with their title preceding their blocks content.',
            label: 'Stack, titled',
            value: 'stack-titled',
          },
          {
            hint:
              'Show items as accordion, with all items collapsed, showing only their titles.',
            label: 'Accordion, closed',
            value: 'accordion-closed',
          },
          {
            hint:
              'Show items as accordion, with the first item expanded, showing both its title and blocks content.',
            label: 'Accordion, open',
            value: 'accordion-open',
          },
          {
            hint:
              'Show items as tabbed interface, with their titles as tab labels and their blocks content in tab panels.',
            label: 'Tabs',
            value: 'tabs',
          },
        ],
      },
    },
    default_value: 'stack-untitled',
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Items" (`items`) in block model "\uD83D\uDDC3\uFE0F Grouping Block" (`grouping_block`)',
  );
  await client.fields.create(groupingBlock.id, {
    id: 'ZEgzOa7HRnqDBc-FgI0RFQ',
    label: 'Items',
    field_type: 'rich_text',
    api_key: 'items',
    validators: {
      rich_text_blocks: { item_types: [ groupingItem.id ] },
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
    'Create Single-line string field "Title" (`title`) in block model "\uD83D\uDDC2\uFE0F Grouping Item" (`grouping_item`)',
  );
  await client.fields.create(groupingItem.id, {
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
    'Create Modular Content (Multiple blocks) field "Body" (`blocks`) in block model "\uD83D\uDDC2\uFE0F Grouping Item" (`grouping_item`)',
  );
  await client.fields.create(groupingItem.id, {
    id: 'NTDc3vtCRzO5mEsE3gfmOQ',
    label: 'Body',
    field_type: 'rich_text',
    api_key: 'blocks',
    validators: {
      rich_text_blocks: {
        item_types: [
          ...pagePartialBlocks, // add all the blocks from the page partial
          'QYfZyBzIRWKxA1MinIR0aQ', // add VideoBlock missing from Page Partial
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

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`blocks`) in model "\uD83E\uDDE9 Page Partial" (`page_partial`)',
  );
  await client.fields.update('SKLmdv71Rge0rKhJzOFQWQ', {
    validators: {
      rich_text_blocks: {
        item_types: [
          ...pagePartialBlocks, // leave all the blocks from the page partial
          'QYfZyBzIRWKxA1MinIR0aQ', // add missing VideoBlock
          groupingBlock.id,
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
          ...pageBodyBlocks, // leave all the blocks from the page
          groupingBlock.id,
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
          ...homeBodyBlocks, // leave all the blocks from the home page
          groupingBlock.id,
        ],
      },
    },
  });

  console.log('Finalize models/block models');

  console.log(
    'Update block model "\uD83D\uDDC3\uFE0F Grouping Block" (`grouping_block`)',
  );
  await client.itemTypes.update(groupingBlock.id, {
    presentation_title_field: { id: 'Wj5FlZbpRb23MFWVegBEoA', type: 'field' },
  });

  console.log(
    'Update block model "\uD83D\uDDC2\uFE0F Grouping Item" (`grouping_item`)',
  );
  await client.itemTypes.update(groupingItem.id, {
    presentation_title_field: { id: 'SKH6LSKZS12ZmF10nklCXg', type: 'field' },
  });

  console.log('Update model "\uD83E\uDDE9 Page Partial" (`page_partial`)');
  await client.itemTypes.update('DAdmJVaoTZKumF9GYBZDfQ', {
    name: '\uD83E\uDDE9 Page Partial',
  });
}
