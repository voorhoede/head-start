import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  // Read current allowlists dynamically so this migration is safe to run at any point.
  //@ts-expect-error rich_text_blocks is only available on Modular Content fields
  const homeBodyBlocks = (await client.fields.find('home_page::body_blocks')).validators.rich_text_blocks?.item_types as string[];
  //@ts-expect-error rich_text_blocks is only available on Modular Content fields
  const pageBodyBlocks = (await client.fields.find('page::body_blocks')).validators.rich_text_blocks?.item_types as string[];
  //@ts-expect-error rich_text_blocks is only available on Modular Content fields
  const pagePartialBlocks = (await client.fields.find('page_partial::blocks')).validators.rich_text_blocks?.item_types as string[];
  // The blocks allowed inside grouping items — reuse for all new item models.
  //@ts-expect-error rich_text_blocks is only available on Modular Content fields
  const groupingItemBlocks = (await client.fields.find('grouping_item::blocks')).validators.rich_text_blocks?.item_types as string[];

  console.log('Create new models/block models');

  // ── Accordion ────────────────────────────────────────────────────────────────

  console.log('Create block model "🪗 Accordion Block" (`accordion_block`)');
  const accordionBlock = await client.itemTypes.create(
    {
      name: '🪗 Accordion Block',
      api_key: 'accordion_block',
      modular_block: true,
      draft_saving_active: false,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true },
  );

  console.log('Create block model "🪗 Accordion Item" (`accordion_item`)');
  const accordionItem = await client.itemTypes.create(
    {
      name: '🪗 Accordion Item',
      api_key: 'accordion_item',
      modular_block: true,
      draft_saving_active: false,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true },
  );

  // ── Tabs ─────────────────────────────────────────────────────────────────────

  console.log('Create block model "🗂️ Tabs Block" (`tabs_block`)');
  const tabsBlock = await client.itemTypes.create(
    {
      name: '🗂️ Tabs Block',
      api_key: 'tabs_block',
      modular_block: true,
      draft_saving_active: false,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true },
  );

  console.log('Create block model "🗂️ Tabs Item" (`tabs_item`)');
  const tabsItem = await client.itemTypes.create(
    {
      name: '🗂️ Tabs Item',
      api_key: 'tabs_item',
      modular_block: true,
      draft_saving_active: false,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true },
  );

  // ── Stack ─────────────────────────────────────────────────────────────────────

  console.log('Create block model "📚 Stack Block" (`stack_block`)');
  const stackBlock = await client.itemTypes.create(
    {
      name: '📚 Stack Block',
      api_key: 'stack_block',
      modular_block: true,
      draft_saving_active: false,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true },
  );

  console.log('Create block model "📚 Stack Item" (`stack_item`)');
  const stackItem = await client.itemTypes.create(
    {
      name: '📚 Stack Item',
      api_key: 'stack_item',
      modular_block: true,
      draft_saving_active: false,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true },
  );

  // ── Column ────────────────────────────────────────────────────────────────────

  console.log('Create block model "🏛️ Column Block" (`column_block`)');
  const columnBlock = await client.itemTypes.create(
    {
      name: '🏛️ Column Block',
      api_key: 'column_block',
      modular_block: true,
      draft_saving_active: false,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true },
  );

  console.log('Create block model "🏛️ Column Item" (`column_item`)');
  const columnItem = await client.itemTypes.create(
    {
      name: '🏛️ Column Item',
      api_key: 'column_item',
      modular_block: true,
      draft_saving_active: false,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true },
  );

  console.log('Creating new fields/fieldsets');

  // ── Accordion Block fields ─────────────────────────────────────────────────

  console.log(
    'Create Boolean field "Is first item open on start" (`is_first_item_open_on_start`) in block model "🪗 Accordion Block"',
  );
  await client.fields.create(accordionBlock.id, {
    label: 'Open first item on load',
    field_type: 'boolean',
    api_key: 'is_first_item_open_on_start',
    hint: 'When enabled, the first accordion item will start expanded. All other items start collapsed.',
    appearance: { addons: [], editor: 'boolean', parameters: {} },
    default_value: false,
  });

  console.log(
    'Create Modular Content field "Items" (`items`) in block model "🪗 Accordion Block"',
  );
  await client.fields.create(accordionBlock.id, {
    label: 'Items',
    field_type: 'rich_text',
    api_key: 'items',
    validators: {
      rich_text_blocks: { item_types: [accordionItem.id] },
      size: { min: 1 },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  // ── Accordion Item fields ──────────────────────────────────────────────────

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "🪗 Accordion Item"',
  );
  await client.fields.create(accordionItem.id, {
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
    'Create Modular Content field "Blocks" (`blocks`) in block model "🪗 Accordion Item"',
  );
  await client.fields.create(accordionItem.id, {
    label: 'Blocks',
    field_type: 'rich_text',
    api_key: 'blocks',
    validators: {
      rich_text_blocks: { item_types: groupingItemBlocks },
      size: { min: 1 },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  // ── Tabs Block fields ──────────────────────────────────────────────────────

  console.log(
    'Create Modular Content field "Items" (`items`) in block model "🗂️ Tabs Block"',
  );
  await client.fields.create(tabsBlock.id, {
    label: 'Items',
    field_type: 'rich_text',
    api_key: 'items',
    validators: {
      rich_text_blocks: { item_types: [tabsItem.id] },
      size: { min: 1 },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  // ── Tabs Item fields ───────────────────────────────────────────────────────

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "🗂️ Tabs Item"',
  );
  await client.fields.create(tabsItem.id, {
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
    'Create Modular Content field "Blocks" (`blocks`) in block model "🗂️ Tabs Item"',
  );
  await client.fields.create(tabsItem.id, {
    label: 'Blocks',
    field_type: 'rich_text',
    api_key: 'blocks',
    validators: {
      rich_text_blocks: { item_types: groupingItemBlocks },
      size: { min: 1 },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  // ── Stack Block fields ─────────────────────────────────────────────────────

  console.log(
    'Create Boolean field "Is titled" (`is_titled`) in block model "📚 Stack Block"',
  );
  await client.fields.create(stackBlock.id, {
    label: 'Show titles',
    field_type: 'boolean',
    api_key: 'is_titled',
    hint: 'When enabled, each item\'s title is rendered as a heading above its content.',
    appearance: { addons: [], editor: 'boolean', parameters: {} },
    default_value: false,
  });

  console.log(
    'Create Modular Content field "Items" (`items`) in block model "📚 Stack Block"',
  );
  await client.fields.create(stackBlock.id, {
    label: 'Items',
    field_type: 'rich_text',
    api_key: 'items',
    validators: {
      rich_text_blocks: { item_types: [stackItem.id] },
      size: { min: 1 },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  // ── Stack Item fields ──────────────────────────────────────────────────────

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "📚 Stack Item"',
  );
  await client.fields.create(stackItem.id, {
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    // No required validator — title is optional for untitled stacks.
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: null,
  });

  console.log(
    'Create Modular Content field "Blocks" (`blocks`) in block model "📚 Stack Item"',
  );
  await client.fields.create(stackItem.id, {
    label: 'Blocks',
    field_type: 'rich_text',
    api_key: 'blocks',
    validators: {
      rich_text_blocks: { item_types: groupingItemBlocks },
      size: { min: 1 },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  // ── Column Block fields ────────────────────────────────────────────────────

  console.log(
    'Create Integer field "Number of columns" (`number_of_columns`) in block model "🏛️ Column Block"',
  );
  await client.fields.create(columnBlock.id, {
    label: 'Number of columns',
    field_type: 'integer',
    api_key: 'number_of_columns',
    hint: 'Choose how many columns to display: 2, 3, or 4.',
    validators: {
      required: {},
      number_range: { min: 2, max: 4 },
    },
    appearance: {
      addons: [],
      editor: 'integer',
      parameters: { placeholder: null },
    },
    default_value: 2,
  });

  console.log(
    'Create Modular Content field "Items" (`items`) in block model "🏛️ Column Block"',
  );
  await client.fields.create(columnBlock.id, {
    label: 'Items',
    field_type: 'rich_text',
    api_key: 'items',
    validators: {
      rich_text_blocks: { item_types: [columnItem.id] },
      size: { min: 1 },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  // ── Column Item fields ─────────────────────────────────────────────────────

  console.log(
    'Create Modular Content field "Blocks" (`blocks`) in block model "🏛️ Column Item"',
  );
  await client.fields.create(columnItem.id, {
    label: 'Blocks',
    field_type: 'rich_text',
    api_key: 'blocks',
    validators: {
      rich_text_blocks: { item_types: groupingItemBlocks },
      size: { min: 1 },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  // ── Add all 4 new block types to the allowed-blocks lists ─────────────────
  // grouping_block stays in the lists until Phase 4 (cleanup migration).

  const newBlockIds = [accordionBlock.id, tabsBlock.id, stackBlock.id, columnBlock.id];

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Modular Content field "Body" (`body_blocks`) in model "🏠 Home" (`home_page`)',
  );
  await client.fields.update('pUj2PObgTyC-8X4lvZLMBA', {
    validators: {
      rich_text_blocks: {
        item_types: [...homeBodyBlocks, ...newBlockIds],
      },
    },
  });

  console.log(
    'Update Modular Content field "Body" (`body_blocks`) in model "📑 Page" (`page`)',
  );
  await client.fields.update('Q-z1nyMsQtC8Sr6w6J2oGw', {
    validators: {
      rich_text_blocks: {
        item_types: [...pageBodyBlocks, ...newBlockIds],
      },
    },
  });

  console.log(
    'Update Modular Content field "Blocks" (`blocks`) in model "🧩 Page Partial" (`page_partial`)',
  );
  await client.fields.update('SKLmdv71Rge0rKhJzOFQWQ', {
    validators: {
      rich_text_blocks: {
        item_types: [...pagePartialBlocks, ...newBlockIds],
      },
    },
  });
}
