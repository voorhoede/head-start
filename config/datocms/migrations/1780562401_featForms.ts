import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Create new models/block models');

  console.log('Create block model "\uD83D\uDD18 Form Field" (`form_field`)');
  await client.itemTypes.create(
    {
      id: 'L-xBmok6QCOe6Ck2-IUWsw',
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

  console.log('Create block model "Form field option" (`form_field_option`)');
  await client.itemTypes.create(
    {
      id: 'Memqq5AXRaei-rGJOFlllQ',
      name: 'Form field option',
      api_key: 'form_field_option',
      modular_block: true,
      draft_saving_active: false,
      hint: '',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'H5AS4nZXRJ2g2R_5nszZ2g',
    },
  );

  console.log('Create block model "\uD83D\uDCE9 Form Block" (`form_block`)');
  await client.itemTypes.create(
    {
      id: 'O0aXohhNR1uQgUsDaOVODg',
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
  await client.itemTypes.create(
    {
      id: 'cpbyAb0SScmWIX8IThJ4TQ',
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
  await client.fields.create('L-xBmok6QCOe6Ck2-IUWsw', {
    id: 'NiL1ve6-TJWa1Kwg5FCitQ',
    label: 'Type',
    field_type: 'string',
    api_key: 'field_type',
    validators: {
      required: {},
      enum: {
        values: [
          'text',
          'textarea',
          'phone',
          'email',
          'select',
          'radio',
          'checkbox',
          'date',
        ],
      },
    },
    appearance: {
      addons: [
        {
          id: 'Srdwo4YOREmRtvMAV2otlQ',
          parameters: {
            dependencies:
              '{\n  "select": [\n    "options"\n  ],\n  "checkbox": [\n    "options"\n  ],\n  "radio": [\n    "options"\n  ],\n  "text": [\n    "placeholder"\n  ],\n  "email": [\n    "placeholder"\n  ],\n  "phone": [\n    "placeholder"\n  ],\n  "textarea": [\n    "placeholder"\n  ],\n  "number": [\n    "placeholder"\n  ]\n}',
          },
        },
      ],
      editor: 'string_select',
      parameters: {
        options: [
          { hint: 'Single-line text', label: 'Text', value: 'text' },
          { hint: 'Multi-line text', label: 'Textarea', value: 'textarea' },
          { hint: '', label: 'Phone', value: 'phone' },
          { hint: '', label: 'E-mail', value: 'email' },
          { hint: '', label: 'Select', value: 'select' },
          { hint: '', label: 'Checkbox', value: 'checkbox' },
          { hint: '', label: 'Radio', value: 'radio' },
          { hint: '', label: 'Date', value: 'date' },
        ],
      },
    },
    default_value: 'text',
  });

  console.log(
    'Create Single-line string field "Label" (`label`) in block model "\uD83D\uDD18 Form Field" (`form_field`)',
  );
  await client.fields.create('L-xBmok6QCOe6Ck2-IUWsw', {
    id: 'V6VgleMpRDW7Q3hr9xG7Jg',
    label: 'Label',
    field_type: 'string',
    api_key: 'label',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: true, placeholder: null },
    },
    default_value: null,
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Options" (`options`) in block model "\uD83D\uDD18 Form Field" (`form_field`)',
  );
  await client.fields.create('L-xBmok6QCOe6Ck2-IUWsw', {
    id: 'KnsrHhaKRsyM7dd77yxGAw',
    label: 'Options',
    field_type: 'rich_text',
    api_key: 'options',
    validators: {
      rich_text_blocks: { item_types: ['Memqq5AXRaei-rGJOFlllQ'] },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: false },
    },
    default_value: null,
  });

  console.log(
    'Create Boolean field "Required" (`required`) in block model "\uD83D\uDD18 Form Field" (`form_field`)',
  );
  await client.fields.create('L-xBmok6QCOe6Ck2-IUWsw', {
    id: 'NUdW32y8RR-RM48tJXwerg',
    label: 'Required',
    field_type: 'boolean',
    api_key: 'required',
    appearance: { addons: [], editor: 'boolean', parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Input width" (`input_width`) in block model "\uD83D\uDD18 Form Field" (`form_field`)',
  );
  await client.fields.create('L-xBmok6QCOe6Ck2-IUWsw', {
    id: 'QveOfETkS8eE724Yqc0j5g',
    label: 'Input width',
    field_type: 'string',
    api_key: 'input_width',
    appearance: {
      addons: [],
      editor: 'string_select',
      parameters: {
        options: [
          { hint: '', label: 'Quarter', value: 'span-1' },
          { hint: '', label: 'Half width', value: 'span-2' },
          { hint: '', label: '3 quarters', value: 'span-3' },
          { hint: '', label: 'Full width', value: 'span-4' },
        ],
      },
    },
    default_value: 'span-4',
  });

  console.log(
    'Create Single-line string field "Placeholder" (`placeholder`) in block model "\uD83D\uDD18 Form Field" (`form_field`)',
  );
  await client.fields.create('L-xBmok6QCOe6Ck2-IUWsw', {
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
  await client.fields.create('L-xBmok6QCOe6Ck2-IUWsw', {
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
  await client.fields.create('O0aXohhNR1uQgUsDaOVODg', {
    id: 'O_QuU43RRumZyZGeRSOkPQ',
    label: 'Form',
    field_type: 'link',
    api_key: 'form',
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: ['cpbyAb0SScmWIX8IThJ4TQ'],
      },
      required: {},
    },
    appearance: {
      addons: [],
      editor: 'link_select',
      parameters: { filters: [] },
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Label" (`label`) in block model "Form field option" (`form_field_option`)',
  );
  await client.fields.create('Memqq5AXRaei-rGJOFlllQ', {
    id: 'X8iOtDk8Qd6pnE5M9tZSyA',
    label: 'Label',
    field_type: 'string',
    api_key: 'label',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: null,
  });

  console.log(
    'Create Slug field "Value" (`value`) in block model "Form field option" (`form_field_option`)',
  );
  await client.fields.create('Memqq5AXRaei-rGJOFlllQ', {
    id: 'Sw_9ors3RwOHP_FeQ08Svg',
    label: 'Value',
    field_type: 'slug',
    api_key: 'value',
    validators: {
      slug_title_field: { title_field_id: 'X8iOtDk8Qd6pnE5M9tZSyA' },
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
    'Create Single-line string field "Title" (`title`) in model "\uD83D\uDCE9 Form" (`form`)',
  );
  await client.fields.create('cpbyAb0SScmWIX8IThJ4TQ', {
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
    },
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Fields" (`form_fields`) in model "\uD83D\uDCE9 Form" (`form`)',
  );
  await client.fields.create('cpbyAb0SScmWIX8IThJ4TQ', {
    id: 'OovxCTP9SWapZ7dsk1XTGw',
    label: 'Fields',
    field_type: 'rich_text',
    api_key: 'form_fields',
    localized: true,
    validators: {
      rich_text_blocks: { item_types: ['L-xBmok6QCOe6Ck2-IUWsw'] },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: true },
    },
  });

  console.log(
    'Create Single-line string field "Submit label" (`submit_label`) in model "\uD83D\uDCE9 Form" (`form`)',
  );
  await client.fields.create('cpbyAb0SScmWIX8IThJ4TQ', {
    id: 'bqzhowJ7QYaqpzOmS2Oftw',
    label: 'Submit label',
    field_type: 'string',
    api_key: 'submit_label',
    localized: true,
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
  });

  console.log(
    'Create Slug field "Slug" (`slug`) in model "\uD83D\uDCE9 Form" (`form`)',
  );
  await client.fields.create('cpbyAb0SScmWIX8IThJ4TQ', {
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

  // Fetch current block lists and append form_block so we don't drop any blocks added since this branch was created
  const pagePartialBlocks: string[] = (await client.fields.find('page_partial::blocks')).validators.rich_text_blocks?.item_types ?? [];
  const pageBodyBlocks: string[] = (await client.fields.find('page::body_blocks')).validators.rich_text_blocks?.item_types ?? [];
  const homeBodyBlocks: string[] = (await client.fields.find('home_page::body_blocks')).validators.rich_text_blocks?.item_types ?? [];
  const notFoundBodyBlocks: string[] = (await client.fields.find('not_found_page::body_blocks')).validators.rich_text_blocks?.item_types ?? [];

  const formBlockId = 'O0aXohhNR1uQgUsDaOVODg';

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`blocks`) in model "\uD83E\uDDE9 Page Partial" (`page_partial`)',
  );
  await client.fields.update('SKLmdv71Rge0rKhJzOFQWQ', {
    validators: {
      rich_text_blocks: {
        item_types: [...pagePartialBlocks, formBlockId],
      },
    },
  });

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`body_blocks`) in model "\uD83D\uDCD1 Page" (`page`)',
  );
  await client.fields.update('Q-z1nyMsQtC8Sr6w6J2oGw', {
    validators: {
      rich_text_blocks: {
        item_types: [...pageBodyBlocks, formBlockId],
      },
    },
  });

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`body_blocks`) in model "\uD83C\uDFE0 Home" (`home_page`)',
  );
  await client.fields.update('pUj2PObgTyC-8X4lvZLMBA', {
    validators: {
      rich_text_blocks: {
        item_types: [...homeBodyBlocks, formBlockId],
      },
    },
  });

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`body_blocks`) in model "\uD83E\uDD37 Not found" (`not_found_page`)',
  );
  await client.fields.update('Zu006Xq0TMCAvV-vyQ_Iiw', {
    validators: {
      rich_text_blocks: {
        item_types: [...notFoundBodyBlocks, formBlockId],
      },
    },
  });

  console.log('Finalize models/block models');

  console.log('Update block model "\uD83D\uDD18 Form Field" (`form_field`)');
  await client.itemTypes.update('L-xBmok6QCOe6Ck2-IUWsw', {
    presentation_title_field: { id: 'NiL1ve6-TJWa1Kwg5FCitQ', type: 'field' },
  });

  console.log('Update block model "Form field option" (`form_field_option`)');
  await client.itemTypes.update('Memqq5AXRaei-rGJOFlllQ', {
    presentation_title_field: { id: 'X8iOtDk8Qd6pnE5M9tZSyA', type: 'field' },
  });

  console.log('Update model "\uD83D\uDCE9 Form" (`form`)');
  await client.itemTypes.update('cpbyAb0SScmWIX8IThJ4TQ', {
    presentation_title_field: { id: 'N2wCMNX0T3CXGsgE80x4uA', type: 'field' },
    title_field: { id: 'N2wCMNX0T3CXGsgE80x4uA', type: 'field' },
  });

  console.log('Manage menu items');

  console.log('Create menu item "\uD83D\uDCE9 Form"');
  await client.menuItems.create({
    id: 'AW91-cZPTomwWBaroOBNzQ',
    label: '\uD83D\uDCE9 Form',
    item_type: { id: 'cpbyAb0SScmWIX8IThJ4TQ', type: 'item_type' },
  });

  console.log('Manage schema menu items');

  console.log(
    'Update block schema menu item for block model "\uD83D\uDCE9 Form Block" (`form_block`)',
  );
  await client.schemaMenuItems.update('M1IZ5VtrT36y02ik-sbZlw', {
    position: 29,
  });

  console.log(
    'Update block schema menu item for block model "\uD83D\uDD18 Form Field" (`form_field`)',
  );
  await client.schemaMenuItems.update('L4vSFicIRTWHFVOZa8tE1w', {
    position: 30,
  });

  console.log(
    'Update block schema menu item for block model "Form field option" (`form_field_option`)',
  );
  await client.schemaMenuItems.update('H5AS4nZXRJ2g2R_5nszZ2g', {
    position: 31,
  });

  console.log(
    'Update model schema menu item for model "\uD83D\uDCE9 Form" (`form`)',
  );
  await client.schemaMenuItems.update('Cjj7jAnnRuaJ-q2_aT06Lw', {
    position: 33,
  });
}
