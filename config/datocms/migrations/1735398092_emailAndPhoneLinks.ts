import type { Client } from '@datocms/cli/lib/cma-client-node';
import { actionStyleField } from './1734363388_actionBlock';

export default async function (client: Client) {
  console.log('Manage upload filters');

  console.log('Install plugin "Dropdown Conditional Fields"');
  await client.plugins.create({
    id: 'Srdwo4YOREmRtvMAV2otlQ',
    package_name: 'datocms-plugin-dropdown-conditional-fields',
  });

  console.log('Create new models/block models');

  console.log('Create block model "\uD83D\uDCDE Phone Link" (`phone_link`)');
  await client.itemTypes.create(
    {
      id: 'C5fWG5CYRJ69oqaP6CjYdA',
      name: '\uD83D\uDCDE Phone Link',
      api_key: 'phone_link',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'YNbDA4R-Srqf0u4-Rya3Ug',
    }
  );

  console.log('Create block model "\uD83D\uDCE7 Email Link" (`email_link`)');
  await client.itemTypes.create(
    {
      id: 'b90_c2zeS6auRELEzZHNcA',
      name: '\uD83D\uDCE7 Email Link',
      api_key: 'email_link',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'Vgf9ZeHvTqeh-tMAks2jFw',
    }
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "\uD83D\uDCDE Phone Link" (`phone_link`)'
  );
  await client.fields.create('C5fWG5CYRJ69oqaP6CjYdA', {
    id: 'fp9Cugu8QlKqawis3QTnPA',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log(
    'Create Single-line string field "Phone number" (`phone_number`) in block model "\uD83D\uDCDE Phone Link" (`phone_link`)'
  );
  await client.fields.create('C5fWG5CYRJ69oqaP6CjYdA', {
    id: 'bfnOOp5cSM-x8S5RKEpKsw',
    label: 'Phone number',
    field_type: 'string',
    api_key: 'phone_number',
    hint: 'Best to use international notation: +31 20 2610954',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log(
    'Create Single-line string field "Action" (`action`) in block model "\uD83D\uDCDE Phone Link" (`phone_link`)'
  );
  await client.fields.create('C5fWG5CYRJ69oqaP6CjYdA', {
    id: 'ZbVIU9fdQgG8IFcEqIQ54A',
    label: 'Action',
    field_type: 'string',
    api_key: 'action',
    validators: { required: {}, enum: { values: ['call', 'sms', 'whatsapp'] } },
    appearance: {
      addons: [
        {
          id: 'Srdwo4YOREmRtvMAV2otlQ',
          parameters: {
            dependencies:
              '{\n  "sms": [\n    "text"\n  ],\n  "whatsapp": [\n    "text"\n  ]\n}',
          },
        },
      ],
      editor: 'string_select',
      parameters: {
        options: [
          { hint: '', label: 'Call', value: 'call' },
          { hint: '', label: 'Text (sms)', value: 'sms' },
          { hint: '', label: 'WhatsApp', value: 'whatsapp' },
        ],
      },
    },
    default_value: 'call',
  });

  console.log(
    'Create Multiple-paragraph text field "Text" (`text`) in block model "\uD83D\uDCDE Phone Link" (`phone_link`)'
  );
  await client.fields.create('C5fWG5CYRJ69oqaP6CjYdA', {
    id: 'FKNWfZ5FS-KwBcWn9H8C7A',
    label: 'Text',
    field_type: 'text',
    api_key: 'text',
    validators: { sanitized_html: { sanitize_before_validation: true } },
    appearance: {
      addons: [],
      editor: 'textarea',
      parameters: { placeholder: null },
      type: 'textarea',
    },
    default_value: '',
  });

  console.log(
    'Create Single-line string field "Style" (`style`) in block model "\uD83D\uDCDE Phone Link" (`phone_link`)'
  );
  await client.fields.create('C5fWG5CYRJ69oqaP6CjYdA', {
    id: 'GnHv18BPRyCsFsCAGmX0cQ',
    ...actionStyleField,
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "\uD83D\uDCE7 Email Link" (`email_link`)'
  );
  await client.fields.create('b90_c2zeS6auRELEzZHNcA', {
    id: 'RM3FgSTnT4W5lYs16ndS9Q',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log(
    'Create Single-line string field "Email address" (`email_address`) in block model "\uD83D\uDCE7 Email Link" (`email_link`)'
  );
  await client.fields.create('b90_c2zeS6auRELEzZHNcA', {
    id: 'VpbcpEhCS5OjLjrdUU8Z6w',
    label: 'Email address',
    field_type: 'string',
    api_key: 'email_address',
    validators: { required: {}, format: { predefined_pattern: 'email' } },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log(
    'Create Single-line string field "Email Subject" (`email_subject`) in block model "\uD83D\uDCE7 Email Link" (`email_link`)'
  );
  await client.fields.create('b90_c2zeS6auRELEzZHNcA', {
    id: 'LMloAtp6SxOTDuaxCQ7L9g',
    label: 'Email Subject',
    field_type: 'string',
    api_key: 'email_subject',
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log(
    'Create Multiple-paragraph text field "Email Body" (`email_body`) in block model "\uD83D\uDCE7 Email Link" (`email_link`)'
  );
  await client.fields.create('b90_c2zeS6auRELEzZHNcA', {
    id: 'DvV-XIMvT-eioHVaY6AOeQ',
    label: 'Email Body',
    field_type: 'text',
    api_key: 'email_body',
    appearance: {
      addons: [],
      editor: 'textarea',
      parameters: { placeholder: null },
      type: 'textarea',
    },
    default_value: '',
  });

  console.log(
    'Create Single-line string field "Style" (`style`) in block model "\uD83D\uDCE7 Email Link" (`email_link`)'
  );
  await client.fields.create('b90_c2zeS6auRELEzZHNcA', {
    id: 'OAAORe89QV-DoOO1GfG5Jw',
    ...actionStyleField,
  });

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Modular Content (Multiple blocks) field "Items" (`items`) in block model "\uD83C\uDF9B\uFE0F Action Block" (`action_block`)'
  );
  await client.fields.update('dAUckF8qR0edf_f7zam6hA', {
    validators: {
      rich_text_blocks: {
        item_types: [
          'C5fWG5CYRJ69oqaP6CjYdA',
          'GWnhoQDqQoGJj4-sQTVttw',
          'Yk1ge9eTTf25Iwph1Dx3_g',
          'b90_c2zeS6auRELEzZHNcA',
        ],
      },
      size: { min: 1 },
    },
  });
}
