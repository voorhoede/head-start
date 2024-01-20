import type { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Create new models/block models');

  console.log('Create model "\u21AA\uFE0F Redirect Rule" (`redirect_rule`)');
  await client.itemTypes.create(
    {
      // @ts-expect-error next-line DatoCMS auto-generated
      id: 'c0S4sIyiRK-EewRhFEFPLA',
      name: '\u21AA\uFE0F Redirect Rule',
      sortable: true,
      api_key: 'redirect_rule',
      collection_appearance: 'table',
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true }
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "From URL" (`from`) in model "\u21AA\uFE0F Redirect Rule" (`redirect_rule`)'
  );
  await client.fields.create('c0S4sIyiRK-EewRhFEFPLA', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'L0DTI0v1Qeqoj1kkAoqEvA',
    label: 'From URL',
    field_type: 'string',
    api_key: 'from',
    hint: 'URL or URL pattern to redirect from when visited. <br><br>Pattern can contain wildcards (<code>*</code>) and placeholders (<code>:placeholder_name</code>) which can then be used in the <strong>To URL</strong> field below. Examples (related to <strong>To URL</strong> examples below):<br>\n\u2022 <code>/old-page-slug/</code><br>\n\u2022 <code>/en/catalogue/:code/details/:name</code><br>\n\u2022 <code>/archive/*</code><br><br>\nSee <a href="https://developers.cloudflare.com/pages/configuration/redirects/">Cloudflare documentation on redirects</a> for more info.',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false },
    },
    default_value: '',
  });

  console.log(
    'Create Single-line string field "To URL" (`to`) in model "\u21AA\uFE0F Redirect Rule" (`redirect_rule`)'
  );
  await client.fields.create('c0S4sIyiRK-EewRhFEFPLA', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'S9_kd7NPQ3-2jM1TfUq1Pw',
    label: 'To URL',
    field_type: 'string',
    api_key: 'to',
    hint: 'URL or URL pattern to redirect a visitor to.<br><br>Pattern can contain any placeholders (<code>:placeholder_name</code>) and a splat (<code>:splat</code>) if a wildcard was used in the <strong>From URL</strong> field above. Examples (related to <strong>From URL</strong> examples above):<br>\n\u2022 <code>/en/new-page-slug/</code><br>\n\u2022 <code>/en/products/:code-:name</code><br>\n\u2022 <code>/en/:splat/</code><br><br>\nSee <a href="https://developers.cloudflare.com/pages/configuration/redirects/">Cloudflare documentation on redirects</a> for more info.',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false },
    },
    default_value: '',
  });

  console.log(
    'Create Single-line string field "Type" (`status_code`) in model "\u21AA\uFE0F Redirect Rule" (`redirect_rule`)'
  );
  await client.fields.create('c0S4sIyiRK-EewRhFEFPLA', {
    // @ts-expect-error next-line DatoCMS auto-generated
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
            hint: 'Is checked on the server every time. Best for changing redirects.',
            label: 'Temporary redirect',
            value: '302',
          },
        ],
      },
    },
    default_value: '302',
  });

  console.log('Finalize models/block models');

  console.log('Update model "\u21AA\uFE0F Redirect Rule" (`redirect_rule`)');
  await client.itemTypes.update('c0S4sIyiRK-EewRhFEFPLA', {
    title_field: { id: 'L0DTI0v1Qeqoj1kkAoqEvA', type: 'field' },
  });

  console.log('Manage menu items');

  console.log('Create menu item "\u21AA\uFE0F Redirect Rules"');
  await client.menuItems.create({
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'dnTgBYv_RYeT_2VXK7SV-A',
    label: '\u21AA\uFE0F Redirect Rules',
    item_type: { id: 'c0S4sIyiRK-EewRhFEFPLA', type: 'item_type' },
  });

  console.log('Delete menu item "Schema migration"');
  await client.menuItems.destroy('NCW3JSnoTgWVSSTaf4iBYw');

  console.log('Update menu item "\uD83C\uDF10 Translations"');
  await client.menuItems.update('1304241', {
    label: '\uD83C\uDF10 Translations',
    position: 7,
  });

  console.log('Update menu item "\uD83D\uDCD1 Pages"');
  await client.menuItems.update('1569863', { label: '\uD83D\uDCD1 Pages' });

  console.log('Update menu item "404 Page"');
  await client.menuItems.update('1690698', { label: '404 Page' });

  console.log('Update menu item "\u21AA\uFE0F Redirect Rules"');
  await client.menuItems.update('dnTgBYv_RYeT_2VXK7SV-A', { position: 6 });

  console.log('Update menu item "\uD83C\uDFE0 Home"');
  await client.menuItems.update('1291667', { label: '\uD83C\uDFE0 Home' });
}
