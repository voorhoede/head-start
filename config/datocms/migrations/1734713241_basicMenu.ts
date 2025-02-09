import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Create new models/block models');
  const home = await client.itemTypes.find('home_page');
  const page = await client.itemTypes.find('page');
  
  console.log('Create model "\uD83D\uDDA5\uFE0F Website" (`app`)');
  await client.itemTypes.create(
    {
      id: 'Zrs1dDxCTXKDS0pdgh1yCw',
      name: '\uD83D\uDDA5\uFE0F Website',
      singleton: true,
      api_key: 'app',
      all_locales_required: true,
      collection_appearance: 'table',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'P2SJT0EVRq-OvOe-tZrcNQ',
    }
  );

  console.log(
    'Create block model "\uD83D\uDD17 Menu Item (Internal)" (`menu_item_internal`)'
  );
  await client.itemTypes.create(
    {
      id: 'FmR0GklXRq-7Ix8-5MaJjw',
      name: '\uD83D\uDD17 Menu Item (Internal)',
      api_key: 'menu_item_internal',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'M-BEy8lTRnugJP_I7gwyZA',
    }
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Modular Content (Multiple blocks) field "Menu Items" (`menu_items`) in model "\uD83D\uDDA5\uFE0F Website" (`app`)'
  );
  await client.fields.create('Zrs1dDxCTXKDS0pdgh1yCw', {
    id: 'Bs4xoWrqTgCfLiNIzFaplw',
    label: 'Menu Items',
    field_type: 'rich_text',
    api_key: 'menu_items',
    localized: true,
    validators: {
      rich_text_blocks: { item_types: ['FmR0GklXRq-7Ix8-5MaJjw'] },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: true },
    },
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "\uD83D\uDD17 Menu Item (Internal)" (`menu_item_internal`)'
  );
  await client.fields.create('FmR0GklXRq-7Ix8-5MaJjw', {
    id: 'VZLI-ydZTtGSypAKrnWEHQ',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    hint: 'Optional title. By default the title of the linked record will be used.',
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log(
    'Create Single link field "Link" (`link`) in block model "\uD83D\uDD17 Menu Item (Internal)" (`menu_item_internal`)'
  );
  await client.fields.create('FmR0GklXRq-7Ix8-5MaJjw', {
    id: 'LRhrTAY1QCG_wHWshhPNWQ',
    label: 'Link',
    field_type: 'link',
    api_key: 'link',
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: [page.id, home.id],
      },
      required: {},
    },
    appearance: { addons: [], editor: 'link_select', parameters: {} },
    default_value: null,
  });

  console.log('Manage menu items');

  console.log('Create menu item "\uD83D\uDDA5\uFE0F Website"');
  await client.menuItems.create({
    id: 'fH6qGXA2TxyijCndT22-lg',
    label: '\uD83D\uDDA5\uFE0F Website',
    item_type: { id: 'Zrs1dDxCTXKDS0pdgh1yCw', type: 'item_type' },
  });

  console.log('Update menu item "\uD83D\uDDA5\uFE0F Website"');
  await client.menuItems.update('fH6qGXA2TxyijCndT22-lg', { position: 2 });
}
