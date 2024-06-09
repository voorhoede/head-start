import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Manage upload filters');

  console.log('Install plugin "Computed Fields"');
  await client.plugins.create({
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'dhY_gsIPQg2l9QgHBOPuKw',
    package_name: 'datocms-plugin-computed-fields',
  });
  await client.plugins.update('dhY_gsIPQg2l9QgHBOPuKw', {
    parameters: { migratedFromLegacyPlugin: true },
  });

  console.log('Create new models/block models');

  console.log('Create model "\uD83D\uDDC4\uFE0F File" (`file`)');
  await client.itemTypes.create(
    {
      // @ts-expect-error next-line DatoCMS auto-generated
      id: 'XBngV6ijQXOHq1YarFQ1qw',
      name: '\uD83D\uDDC4\uFE0F File',
      api_key: 'file',
      collection_appearance: 'table',
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true }
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single asset field "File" (`file`) in model "\uD83D\uDDC4\uFE0F File" (`file`)'
  );
  await client.fields.create('XBngV6ijQXOHq1YarFQ1qw', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'ZRkSnU8LRVmTzlsYiIQ2LQ',
    label: 'File',
    field_type: 'file',
    api_key: 'file',
    validators: { required: {} },
    appearance: { addons: [], editor: 'file', parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Slug" (`slug`) in model "\uD83D\uDDC4\uFE0F File" (`file`)'
  );
  await client.fields.create('XBngV6ijQXOHq1YarFQ1qw', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'e5L0ZnGcRiGgAYvsu3bV9w',
    label: 'Slug',
    field_type: 'string',
    api_key: 'slug',
    hint: 'Optional custom slug, like <code>/my-files/example.pdf</code>. This may be useful if you need files to be available under a specific URL.',
    validators: { format: { custom_pattern: '^/.*' } },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false },
    },
    default_value: '',
  });

  console.log(
    'Create Single-line string field "Locale" (`locale`) in model "\uD83D\uDDC4\uFE0F File" (`file`)'
  );
  await client.fields.create('XBngV6ijQXOHq1YarFQ1qw', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'Ll-qmoOSROGcXB5W_WpDpQ',
    label: 'Locale',
    field_type: 'string',
    api_key: 'locale',
    hint: 'Only relevant for files containing text.',
    appearance: {
      addons: [],
      editor: 'string_select',
      parameters: {
        options: [
          { hint: '', label: 'Deutsch', value: 'de' },
          { hint: '', label: 'English', value: 'en' },
          { hint: '', label: 'Espa\u00F1ol', value: 'es' },
          { hint: '', label: 'Fran\u00E7ais', value: 'fr' },
          { hint: '', label: 'Italiano', value: 'it' },
          { hint: '', label: 'Nederlands', value: 'nl' },
        ],
      },
    },
    default_value: '',
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in model "\uD83D\uDDC4\uFE0F File" (`file`)'
  );
  await client.fields.create('XBngV6ijQXOHq1YarFQ1qw', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'T0TxZWcVS6-RhZsx9OQ0dQ',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    hint: 'This title is automatically generated based on the filename of the selected file. This ensures you can recognise this record in overviews and when inserting it in a text field.',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'dhY_gsIPQg2l9QgHBOPuKw',
      parameters: {
        editFunction: false,
        defaultFunction:
          'const upload = await getUpload(file.upload_id)\nreturn `${upload.filename}`',
      },
      field_extension: 'computedFields',
    },
    default_value: '',
  });

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Structured text field "Text" (`text`) in block model "Text Image Block" (`text_image_block`)'
  );
  await client.fields.update('V4dMfrWsQ027JYEp6q3KhA', {
    validators: {
      required: {},
      structured_text_blocks: {
        item_types: [
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
      structured_text_links: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: ['WywlzYXpSVWFQIeeNk3iMw', 'XBngV6ijQXOHq1YarFQ1qw'],
      },
    },
  });

  console.log(
    'Update Structured text field "Text" (`text`) in block model "\uD83D\uDCDD Text Block" (`text_block`)'
  );
  await client.fields.update('NtVXfZ6gTL2sKNffNeUf5Q', {
    validators: {
      required: {},
      structured_text_blocks: {
        item_types: [
          'QYfZyBzIRWKxA1MinIR0aQ',
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
      structured_text_links: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: ['WywlzYXpSVWFQIeeNk3iMw', 'XBngV6ijQXOHq1YarFQ1qw'],
      },
    },
  });

  console.log('Finalize models/block models');

  console.log('Update model "\uD83D\uDDC4\uFE0F File" (`file`)');
  await client.itemTypes.update('XBngV6ijQXOHq1YarFQ1qw', {
    title_field: { id: 'T0TxZWcVS6-RhZsx9OQ0dQ', type: 'field' },
    image_preview_field: { id: 'ZRkSnU8LRVmTzlsYiIQ2LQ', type: 'field' },
  });

  console.log('Manage menu items');

  console.log('Create menu item "\uD83D\uDDC4\uFE0F Files"');
  await client.menuItems.create({
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'Cgji47DQSbOLni8KquktFg',
    label: '\uD83D\uDDC4\uFE0F Files',
    item_type: { id: 'XBngV6ijQXOHq1YarFQ1qw', type: 'item_type' },
  });

  console.log('Update menu item "\uD83D\uDDC4\uFE0F Files"');
  await client.menuItems.update('Cgji47DQSbOLni8KquktFg', { position: 6 });
}
