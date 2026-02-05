import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Create new models/block models');

  console.log(
    'Create block model "\uD83D\uDD3D Menu Item (External)" (`menu_item_external`)',
  );
  await client.itemTypes.create(
    {
      id: 'HK5FsUejSR-11KojiPoWbQ',
      name: '\uD83D\uDD3D Menu Item (External)',
      api_key: 'menu_item_external',
      modular_block: true,
      draft_saving_active: false,
      hint: 'Use this item to link to an external website (outside of this site).\n\nYou can also add sub-items if this link should open a dropdown. Sub-items may link to internal or external pages.\n\nThe menu supports a maximum of 3 levels of nesting. Deeper levels will be ignored in the navigation.',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'JRXsR-1GR1eRt5KS1QgErw',
    },
  );

  console.log(
    'Create block model "\uD83D\uDD3D Menu Item (Group)" (`menu_item_group`)',
  );
  await client.itemTypes.create(
    {
      id: 'TolRinJHS4GC8C2mw2iiXQ',
      name: '\uD83D\uDD3D Menu Item (Group)',
      api_key: 'menu_item_group',
      modular_block: true,
      draft_saving_active: false,
      hint: 'Use this item to create a non-clickable menu label that groups related links together.\n\nThe title itself is not a link and will only be used as a heading in the menu. Add sub-items underneath it to create the actual links.\n\nSub-items can be internal or external links and can be nested up to 3 levels deep.\nAvoid adding deeper levels, as they will not be displayed.',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'SH2HQHLdT_eLrOXQMMQ_kw',
    },
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "\uD83D\uDD3D Menu Item (External)" (`menu_item_external`)',
  );
  await client.fields.create('HK5FsUejSR-11KojiPoWbQ', {
    id: 'I8HNHQLsTCuHpLxk3F3GPQ',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    hint: 'Optional title. By default the title of the linked record will be used.',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log(
    'Create Single link field "Link" (`link`) in block model "\uD83D\uDD3D Menu Item (External)" (`menu_item_external`)',
  );
  await client.fields.create('HK5FsUejSR-11KojiPoWbQ', {
    id: 'XzD-DFzpRf-6jUvETIge3w',
    label: 'Link',
    field_type: 'link',
    api_key: 'link',
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: [],
      },
      required: {},
    },
    appearance: { addons: [], editor: 'link_select', parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Items" (`items`) in block model "\uD83D\uDD3D Menu Item (External)" (`menu_item_external`)',
  );
  await client.fields.create('HK5FsUejSR-11KojiPoWbQ', {
    id: 'QFHlwZngSF6iFXGw4n03NA',
    label: 'Items',
    field_type: 'rich_text',
    api_key: 'items',
    validators: {
      rich_text_blocks: {
        item_types: ['FmR0GklXRq-7Ix8-5MaJjw', 'HK5FsUejSR-11KojiPoWbQ'],
      },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "\uD83D\uDD3D Menu Item (Group)" (`menu_item_group`)',
  );
  await client.fields.create('TolRinJHS4GC8C2mw2iiXQ', {
    id: 'SltvI6TZTpGS8EOpAnxqwQ',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    hint: 'Optional title. By default the title of the linked record will be used.',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Items" (`items`) in block model "\uD83D\uDD3D Menu Item (Group)" (`menu_item_group`)',
  );
  await client.fields.create('TolRinJHS4GC8C2mw2iiXQ', {
    id: 'fZ_sddl4Q6OD5qtcmbwrBA',
    label: 'Items',
    field_type: 'rich_text',
    api_key: 'items',
    validators: {
      rich_text_blocks: {
        item_types: ['FmR0GklXRq-7Ix8-5MaJjw', 'HK5FsUejSR-11KojiPoWbQ'],
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
    'Create Modular Content (Multiple blocks) field "Items" (`items`) in block model "\uD83D\uDD3D Menu Item (Internal)" (`menu_item_internal`)',
  );
  await client.fields.create('FmR0GklXRq-7Ix8-5MaJjw', {
    id: 'ERIaYZ9RQpeR7zhw5drWvg',
    label: 'Items',
    field_type: 'rich_text',
    api_key: 'items',
    validators: {
      rich_text_blocks: {
        item_types: ['FmR0GklXRq-7Ix8-5MaJjw', 'HK5FsUejSR-11KojiPoWbQ'],
      },
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
    'Update Modular Content (Multiple blocks) field "Menu Items" (`menu_items`) in model "\uD83D\uDDA5\uFE0F Website" (`app`)',
  );
  await client.fields.update('Bs4xoWrqTgCfLiNIzFaplw', {
    validators: {
      rich_text_blocks: {
        item_types: [
          'FmR0GklXRq-7Ix8-5MaJjw',
          'HK5FsUejSR-11KojiPoWbQ',
          'TolRinJHS4GC8C2mw2iiXQ',
        ],
      },
    },
  });

  console.log('Finalize models/block models');

  console.log(
    'Update block model "\uD83D\uDD3D Menu Item (Internal)" (`menu_item_internal`)',
  );
  await client.itemTypes.update('FmR0GklXRq-7Ix8-5MaJjw', {
    name: '\uD83D\uDD3D Menu Item (Internal)',
    hint: 'Use this item to link to a page within the website.\n\nYou can optionally add sub-items to create a dropdown menu. Sub-items can link to either internal or external pages.\n\nThe menu supports up to 3 levels of nesting (main item \u2192 sub-item \u2192 sub-sub-item). Avoid adding deeper levels, as they will not be displayed.',
  });

  console.log('Manage schema menu items');

  console.log(
    'Update block schema menu item for block model "\uD83D\uDD3D Menu Item (External)" (`menu_item_external`)',
  );
  await client.schemaMenuItems.update('JRXsR-1GR1eRt5KS1QgErw', {
    position: 24,
  });

  console.log(
    'Update block schema menu item for block model "\uD83D\uDD3D Menu Item (Group)" (`menu_item_group`)',
  );
  await client.schemaMenuItems.update('SH2HQHLdT_eLrOXQMMQ_kw', {
    position: 25,
  });
}
