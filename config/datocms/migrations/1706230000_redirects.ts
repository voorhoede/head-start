import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Create model "\u21AA\uFE0F Redirect Rule" (`redirect_rule`)');
  await client.itemTypes.create(
    {
      id: 'c0S4sIyiRK-EewRhFEFPLA',
      name: '\u21AA\uFE0F Redirect Rule',
      sortable: true,
      api_key: 'redirect_rule',
      collection_appearance: 'table',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'BRzL0jdbQQqacDw3HUCsQg',
    },
  );
  console.log(
    'Create Single-line string field "From URL" (`from`) in model "\u21AA\uFE0F Redirect Rule" (`redirect_rule`)',
  );
  await client.fields.create('c0S4sIyiRK-EewRhFEFPLA', {
    id: 'L0DTI0v1Qeqoj1kkAoqEvA',
    label: 'From URL',
    field_type: 'string',
    api_key: 'from',
    hint:
      'URL or URL pattern to redirect from when visited. <br><br>Pattern can contain wildcards (<code>*</code>) and placeholders (<code>:placeholder_name</code>) which can then be used in the <strong>To URL</strong> field below. Examples (related to <strong>To URL</strong> examples below):<br>\n\u2022 <code>/old-page-slug/</code><br>\n\u2022 <code>/en/catalogue/:code/details/:name</code><br>\n\u2022 <code>/archive/*</code>',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log(
    'Create Single-line string field "To URL" (`to`) in model "\u21AA\uFE0F Redirect Rule" (`redirect_rule`)',
  );
  await client.fields.create('c0S4sIyiRK-EewRhFEFPLA', {
    id: 'S9_kd7NPQ3-2jM1TfUq1Pw',
    label: 'To URL',
    field_type: 'string',
    api_key: 'to',
    hint:
      'URL or URL pattern to redirect a visitor to.<br><br>Pattern can contain any placeholders (<code>:placeholder_name</code>) and a splat (<code>:splat</code>) if a wildcard was used in the <strong>From URL</strong> field above. Examples (related to <strong>From URL</strong> examples above):<br>\n\u2022 <code>/en/new-page-slug/</code><br>\n\u2022 <code>/en/products/:code-:name</code><br>\n\u2022 <code>/en/:splat/</code>',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log(
    'Create Single-line string field "Type" (`status_code`) in model "\u21AA\uFE0F Redirect Rule" (`redirect_rule`)',
  );
  await client.fields.create('c0S4sIyiRK-EewRhFEFPLA', {
    id: 'Bfb1Y4ZCT-2ciVjqeFMlaQ',
    label: 'Type',
    field_type: 'string',
    api_key: 'status_code',
    validators: { required: {}, enum: { values: ['301', '302'] } },
    appearance: {
      addons: [],
      editor: 'string_radio_group',
      parameters: {
        radios: [
          {
            hint: 'Is remembered by the browser. Best for performance.',
            label: 'Permanent redirect',
            value: '301',
          },
          {
            hint:
              'Is checked on the server every time. Best for changing redirects.',
            label: 'Temporary redirect',
            value: '302',
          },
        ],
      },
    },
    default_value: '302',
  });
}
