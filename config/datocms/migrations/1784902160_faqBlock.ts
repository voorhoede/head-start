import { Client, SimpleSchemaTypes } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  //@ts-expect-error rich_text_blocks is only available on Modular Content fields
  const homeBodyBlocks = (await client.fields.find('home_page::body_blocks')).validators.rich_text_blocks?.item_types as string[];
  //@ts-expect-error rich_text_blocks is only available on Modular Content fields
  const pageBodyBlocks = (await client.fields.find('page::body_blocks')).validators.rich_text_blocks?.item_types as string[];

  console.log('Create new models/block models');

  console.log('Create block model "\u2753 FAQ Block" (`faq_block`)');
  const faqBlock = await client.itemTypes.create(
    {
      id: 'bwnEedmZRLCodyteEudcIQ',
      name: '\u2753 FAQ Block',
      api_key: 'faq_block',
      modular_block: true,
      draft_saving_active: false,
      hint: '',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'PQtosMOrR_2nUjIwyGI5-w',
    },
  );

  console.log('Create model "\u2753 FAQ" (`faq`)');
  await client.itemTypes.create(
    {
      id: 'Wp8-9-o4Tc2uFPn01WwxYQ',
      name: '\u2753 FAQ',
      api_key: 'faq',
      draft_mode_active: true,
      draft_saving_active: false,
      collection_appearance: 'table',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'XAz-FlSfTumPrm_vuq20lQ',
    },
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "Group title" (`group_title`) in block model "\u2753 FAQ Block" (`faq_block`)',
  );
  await client.fields.create('bwnEedmZRLCodyteEudcIQ', {
    id: 'FuciaLmuRR6sm_G3eZ1kaA',
    label: 'Group title',
    field_type: 'string',
    api_key: 'group_title',
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: null,
  });

  console.log(
    'Create Multiple links field "Question and Answers" (`question_and_answers`) in block model "\u2753 FAQ Block" (`faq_block`)',
  );
  await client.fields.create('bwnEedmZRLCodyteEudcIQ', {
    id: 'DmOR-2ehTOyylvEt0S6NJg',
    label: 'Question and Answers',
    field_type: 'links',
    api_key: 'question_and_answers',
    validators: {
      items_item_type: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: ['Wp8-9-o4Tc2uFPn01WwxYQ'],
      },
    },
    appearance: {
      addons: [],
      editor: 'links_embed',
      parameters: { filters: [] },
    },
    default_value: null,
  });

  console.log(
    'Create Slug field "Slug" (`slug`) in model "\u2753 FAQ" (`faq`)',
  );
  await client.fields.create('Wp8-9-o4Tc2uFPn01WwxYQ', {
    id: 'Cs6T765xTlanqEV6ZB01uQ',
    label: 'Slug',
    field_type: 'slug',
    api_key: 'slug',
    validators: {
      slug_format: { predefined_pattern: 'webpage_slug' },
      required: {},
      unique: {},
    },
    appearance: {
      addons: [],
      editor: 'slug',
      parameters: { url_prefix: null, placeholder: null },
    },
    default_value: null,
  });

  console.log(
    'Create Modular Content (Single block) field "Question and Answer" (`question_and_answer`) in model "\u2753 FAQ" (`faq`)',
  );
  // The answer links to the existing "Accordion Item" block model, whose id
  // differs per environment. Resolve it by api_key instead of hardcoding.
  const accordionItem = (await client.itemTypes.list()).find(
    (itemType: SimpleSchemaTypes.ItemType) => itemType.api_key === 'accordion_item',
  );
  if (!accordionItem) {
    throw new Error(
      'Could not find the "accordion_item" block model required by the FAQ "Question and Answer" field.',
    );
  }
  await client.fields.create('Wp8-9-o4Tc2uFPn01WwxYQ', {
    id: 'ObBfAPRKQKqulCO-p4ZiAw',
    label: 'Question and Answer',
    field_type: 'single_block',
    api_key: 'question_and_answer',
    validators: {
      single_block_blocks: { item_types: [accordionItem.id] },
      required: {},
    },
    appearance: {
      addons: [],
      editor: 'framed_single_block',
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`body_blocks`) in model "\ud83d\udcd1 Page" (`page`)',
  );
  await client.fields.update('Q-z1nyMsQtC8Sr6w6J2oGw', {
    validators: {
      rich_text_blocks: {
        item_types: [...pageBodyBlocks, faqBlock.id],
      },
    },
  });

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`body_blocks`) in model "\ud83c\udfe0 Home" (`home_page`)',
  );
  await client.fields.update('pUj2PObgTyC-8X4lvZLMBA', {
    validators: {
      rich_text_blocks: {
        item_types: [...homeBodyBlocks, faqBlock.id],
      },
    },
  });

  console.log('Finalize models/block models');

  console.log('Update block model "\u2753 FAQ Block" (`faq_block`)');
  await client.itemTypes.update('bwnEedmZRLCodyteEudcIQ', {
    presentation_title_field: { id: 'FuciaLmuRR6sm_G3eZ1kaA', type: 'field' },
  });

  console.log('Update model "\u2753 FAQ" (`faq`)');
  await client.itemTypes.update('Wp8-9-o4Tc2uFPn01WwxYQ', {
    presentation_title_field: { id: 'ObBfAPRKQKqulCO-p4ZiAw', type: 'field' },
  });

  console.log('Manage menu items');

  console.log('Create menu item "\u2753 FAQ"');
  await client.menuItems.create({
    id: 'c5jZf1KyTsCmRfzpTIwYAA',
    label: '\u2753 FAQ',
    item_type: { id: 'Wp8-9-o4Tc2uFPn01WwxYQ', type: 'item_type' },
  });

  console.log('Update menu item "\u2753 FAQ"');
  await client.menuItems.update('c5jZf1KyTsCmRfzpTIwYAA', { position: 10 });

  console.log('Manage schema menu items');

  console.log('Update model schema menu item for model "\u2753 FAQ" (`faq`)');
  await client.schemaMenuItems.update('XAz-FlSfTumPrm_vuq20lQ', {
    position: 52,
  });

  console.log(
    'Update block schema menu item for block model "\u2753 FAQ Block" (`faq_block`)',
  );
  await client.schemaMenuItems.update('PQtosMOrR_2nUjIwyGI5-w', {
    position: 51,
  });
}
