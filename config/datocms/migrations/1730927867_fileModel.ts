import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Manage upload filters');
  const home = await client.itemTypes.find('home_page');
  const page = await client.itemTypes.find('page');

  console.log('Install plugin "Computed Fields"');
  await client.plugins.create({
    id: 'EiyZ3d0SSDCPCNbsKBIwWQ',
    package_name: 'datocms-plugin-computed-fields',
  });
  await client.plugins.update('EiyZ3d0SSDCPCNbsKBIwWQ', {
    parameters: { migratedFromLegacyPlugin: true },
  });

  console.log('Create new models/block models');

  console.log('Create model "\uD83D\uDCE6 File" (`file`)');
  await client.itemTypes.create(
    {
      id: 'GjWw8t-hTFaYYWyc53FeIg',
      name: '\uD83D\uDCE6 File',
      api_key: 'file',
      collection_appearance: 'table',
      inverse_relationships_enabled: true,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'Q7zpH-QAQJ2XBI2CcBio5w',
    }
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single asset field "File" (`file`) in model "\uD83D\uDCE6 File" (`file`)'
  );
  await client.fields.create('GjWw8t-hTFaYYWyc53FeIg', {
    id: 'LolhguizT_mZMl1zzZtQ4Q',
    label: 'File',
    field_type: 'file',
    api_key: 'file',
    validators: { required: {} },
    appearance: { addons: [], editor: 'file', parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Locale" (`locale`) in model "\uD83D\uDCE6 File" (`file`)'
  );
  await client.fields.create('GjWw8t-hTFaYYWyc53FeIg', {
    id: 'JcOc0SI4RYONRdiNvys1Rg',
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
    'Create Single-line string field "Title" (`title`) in model "\uD83D\uDCE6 File" (`file`)'
  );
  await client.fields.create('GjWw8t-hTFaYYWyc53FeIg', {
    id: 'YIftd04cTlyz0aEvqsfWXA',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    hint: 'This title is automatically generated based on the filename of the selected file. This ensures you can recognise this record in overviews and when inserting it in a text field.',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'EiyZ3d0SSDCPCNbsKBIwWQ',
      parameters: {
        defaultFunction:
          'const upload = await getUpload(file.upload_id)\nreturn `${upload.filename}`',
      },
      field_extension: 'computedFields',
    },
    default_value: '',
  });

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Structured text field "Text" (`text`) in block model "\uD83D\uDCDD \uD83D\uDDBC\uFE0F Text Image Block" (`text_image_block`)'
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
        item_types: [
          'GjWw8t-hTFaYYWyc53FeIg',
          page.id,
          home.id
        ],
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
        item_types: [
          'GjWw8t-hTFaYYWyc53FeIg',
          page.id,
          home.id
        ],
      },
    },
  });

  console.log('Finalize models/block models');

  console.log('Update model "\uD83D\uDCE6 File" (`file`)');
  await client.itemTypes.update('GjWw8t-hTFaYYWyc53FeIg', {
    title_field: { id: 'YIftd04cTlyz0aEvqsfWXA', type: 'field' },
    image_preview_field: { id: 'LolhguizT_mZMl1zzZtQ4Q', type: 'field' },
  });

  console.log('Manage menu items');

  console.log('Create menu item "\uD83D\uDCE6 Files"');
  await client.menuItems.create({
    id: 'P1lE98ITSp-2unhby2N59g',
    label: '\uD83D\uDCE6 Files',
    item_type: { id: 'GjWw8t-hTFaYYWyc53FeIg', type: 'item_type' },
  });

  console.log('Update menu item "\uD83D\uDCE6 Files"');
  await client.menuItems.update('P1lE98ITSp-2unhby2N59g', { position: 5 });
}
