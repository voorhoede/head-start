import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  //@ts-expect-error rich_text_blocks is only available on Modular Content fields
  const homeBodyBlocks = (await client.fields.find('home_page::body_blocks')).validators.rich_text_blocks?.item_types;
  //@ts-expect-error rich_text_blocks is only available on Modular Content fields
  const pageBodyBlocks = (await client.fields.find('page::body_blocks')).validators.rich_text_blocks?.item_types;
  //@ts-expect-error rich_text_blocks is only available on Modular Content fields
  const pagePartialBlocks = (await client.fields.find('page_partial::blocks')).validators.rich_text_blocks?.item_types;
 
  console.log('Create new models/block models');

  console.log('Create block model "\uD83D\uDD18 Form Field" (`form_field`)');
  const formFieldBlock = await client.itemTypes.create(
    {
      name: '\uD83D\uDD18 Form Field',
      api_key: 'form_field',
      modular_block: true,
      draft_saving_active: false,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'L4vSFicIRTWHFVOZa8tE1w',
    },
  );

  console.log('Create block model "\uD83D\uDCE9 Form Block" (`form_block`)');
  const formBlock = await client.itemTypes.create(
    {
      name: '\uD83D\uDCE9 Form Block',
      api_key: 'form_block',
      modular_block: true,
      draft_saving_active: false,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'M1IZ5VtrT36y02ik-sbZlw',
    },
  );

  console.log('Create model "\uD83D\uDCE9 Form" (`form`)');
  const formRecord = await client.itemTypes.create(
    {
      name: '\uD83D\uDCE9 Form',
      api_key: 'form',
      draft_mode_active: true,
      draft_saving_active: false,
      collection_appearance: 'table',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'Cjj7jAnnRuaJ-q2_aT06Lw',
    },
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "Type" (`field_type`) in block model "\uD83D\uDD18 Form Field" (`form_field`)',
  );
  await client.fields.create(formFieldBlock.id, {
    id: 'NiL1ve6-TJWa1Kwg5FCitQ',
    label: 'Type',
    field_type: 'string',
    api_key: 'field_type',
    validators: {
      required: {},
      enum: { values: ['text', 'textarea', 'phone', 'email', 'file'] },
    },
    appearance: {
      addons: [],
      editor: 'string_select',
      parameters: {
        options: [
          { hint: 'Single-line text', label: 'Text', value: 'text' },
          { hint: 'Multi-line text', label: 'Textarea', value: 'textarea' },
          { hint: '', label: 'Phone', value: 'phone' },
          { hint: '', label: 'E-mail', value: 'email' },
        ],
      },
    },
    default_value: 'text',
  });

  console.log(
    'Create Single-line string field "Label" (`label`) in block model "\uD83D\uDD18 Form Field" (`form_field`)',
  );
  await client.fields.create(formFieldBlock.id, {
    id: 'V6VgleMpRDW7Q3hr9xG7Jg',
    label: 'Label',
    field_type: 'string',
    api_key: 'label',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: true, placeholder: null },
      type: 'title',
    },
    default_value: null,
  });

  console.log(
    'Create Boolean field "Required" (`required`) in block model "\uD83D\uDD18 Form Field" (`form_field`)',
  );
  await client.fields.create(formFieldBlock.id, {
    id: 'NUdW32y8RR-RM48tJXwerg',
    label: 'Required',
    field_type: 'boolean',
    api_key: 'required',
    appearance: { addons: [], editor: 'boolean', parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Placeholder" (`placeholder`) in block model "\uD83D\uDD18 Form Field" (`form_field`)',
  );
  await client.fields.create(formFieldBlock.id, {
    id: 'UmjBZCa1QhqUgWbZujq3Mg',
    label: 'Placeholder',
    field_type: 'string',
    api_key: 'placeholder',
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: null,
  });

  console.log(
    'Create Slug field "Name" (`name`) in block model "\uD83D\uDD18 Form Field" (`form_field`)',
  );
  await client.fields.create(formFieldBlock.id, {
    id: 'O1l36iTYTcKETj0kNrpdXg',
    label: 'Name',
    field_type: 'slug',
    api_key: 'name',
    validators: {
      slug_title_field: { title_field_id: 'V6VgleMpRDW7Q3hr9xG7Jg' },
      slug_format: { predefined_pattern: 'webpage_slug' },
      required: {},
    },
    appearance: {
      addons: [],
      editor: 'slug',
      parameters: { url_prefix: null, placeholder: null },
    },
    default_value: null,
  });

  console.log(
    'Create Single link field "Form" (`form`) in block model "\uD83D\uDCE9 Form Block" (`form_block`)',
  );
  await client.fields.create(formBlock.id, {
    id: 'O_QuU43RRumZyZGeRSOkPQ',
    label: 'Form',
    field_type: 'link',
    api_key: 'form',
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: [formRecord.id],
      },
      required: {},
    },
    appearance: { addons: [], editor: 'link_select', parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in model "\uD83D\uDCE9 Form" (`form`)',
  );
  await client.fields.create(formRecord.id, {
    id: 'N2wCMNX0T3CXGsgE80x4uA',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    localized: true,
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: true, placeholder: null },
      type: 'title',
    },
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Fields" (`form_fields`) in model "\uD83D\uDCE9 Form" (`form`)',
  );
  await client.fields.create(formRecord.id, {
    id: 'OovxCTP9SWapZ7dsk1XTGw',
    label: 'Fields',
    field_type: 'rich_text',
    api_key: 'form_fields',
    localized: true,
    validators: {
      rich_text_blocks: { item_types: [formFieldBlock.id] },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: true },
    },
  });

  console.log(
    'Create Slug field "Slug" (`slug`) in model "\uD83D\uDCE9 Form" (`form`)',
  );
  await client.fields.create(formRecord.id, {
    id: 'KB0B7DyRSbGiZL00-Iegzg',
    label: 'Slug',
    field_type: 'slug',
    api_key: 'slug',
    validators: {
      slug_title_field: { title_field_id: 'N2wCMNX0T3CXGsgE80x4uA' },
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

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`blocks`) in model "\uD83E\uDDE9 Page Partial" (`page_partial`)',
  );
  await client.fields.update('SKLmdv71Rge0rKhJzOFQWQ', {
    validators: {
      rich_text_blocks: {
        item_types: [
          ...pagePartialBlocks,
          formBlock.id,
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
          ...pageBodyBlocks,
          formBlock.id,
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
          ...homeBodyBlocks,
          formBlock.id
        ],
      },
    },
  });

  console.log('Finalize models/block models');

  console.log('Update block model "\uD83D\uDD18 Form Field" (`form_field`)');
  await client.itemTypes.update(formFieldBlock.id, {
    presentation_title_field: { id: 'NiL1ve6-TJWa1Kwg5FCitQ', type: 'field' },
  });

  console.log('Update model "\uD83D\uDCE9 Form" (`form`)');
  await client.itemTypes.update(formRecord.id, {
    presentation_title_field: { id: 'N2wCMNX0T3CXGsgE80x4uA', type: 'field' },
    title_field: { id: 'N2wCMNX0T3CXGsgE80x4uA', type: 'field' },
  });

  console.log('Manage menu items');

  console.log('Create menu item "\uD83D\uDCE9 Form"');
  await client.menuItems.create({
    id: 'AW91-cZPTomwWBaroOBNzQ',
    label: '\uD83D\uDCE9 Form',
    item_type: { id: formRecord.id, type: 'item_type' },
  });
}
