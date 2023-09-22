import type { Client, SimpleSchemaTypes } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newItemTypes: Record<string, SimpleSchemaTypes.ItemType> = {};
  const newMenuItems: Record<string, SimpleSchemaTypes.MenuItem> = {};

  console.log('Create new models/block models');

  console.log('Create model "Page" (`page`)');
  newItemTypes['2596445'] = await client.itemTypes.create(
    {
      name: 'Page',
      api_key: 'page',
      draft_mode_active: true,
      all_locales_required: true,
      collection_appearance: 'table',
      inverse_relationships_enabled: true,
    },
    { skip_menu_item_creation: true }
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "Title" (`title`) in model "Page" (`page`)'
  );
  newFields['13623255'] = await client.fields.create(newItemTypes['2596445'], {
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    localized: true,
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: true },
      type: 'title',
    },
    default_value: { en: '', nl: '' },
  });

  console.log(
    'Create SEO meta tags field "SEO" (`seo`) in model "Page" (`page`)'
  );
  newFields['13623274'] = await client.fields.create(newItemTypes['2596445'], {
    label: 'SEO',
    field_type: 'seo',
    api_key: 'seo',
    localized: true,
    validators: {
      required_seo_fields: {
        title: false,
        description: false,
        image: false,
        twitter_card: false,
      },
      title_length: { max: 60 },
      description_length: { max: 160 },
    },
    appearance: { addons: [], editor: 'seo', parameters: {} },
  });

  console.log('Create Slug field "Slug" (`slug`) in model "Page" (`page`)');
  newFields['13623256'] = await client.fields.create(newItemTypes['2596445'], {
    label: 'Slug',
    field_type: 'slug',
    api_key: 'slug',
    localized: true,
    validators: {
      slug_title_field: { title_field_id: newFields['13623255'].id },
      slug_format: { predefined_pattern: 'webpage_slug' },
      required: {},
      unique: {},
    },
    appearance: {
      addons: [],
      editor: 'slug',
      parameters: { url_prefix: null },
    },
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in model "Home" (`home`)'
  );
  newFields['13623276'] = await client.fields.create('2216253', {
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    localized: true,
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: true },
      type: 'title',
    },
    default_value: { en: '', nl: '' },
  });

  console.log(
    'Create SEO meta tags field "SEO" (`seo`) in model "Home" (`home`)'
  );
  newFields['13623277'] = await client.fields.create('2216253', {
    label: 'SEO',
    field_type: 'seo',
    api_key: 'seo',
    localized: true,
    validators: {
      required_seo_fields: {
        title: false,
        description: false,
        image: false,
        twitter_card: false,
      },
      title_length: { max: 60 },
      description_length: { max: 160 },
    },
    appearance: { addons: [], editor: 'seo', parameters: {} },
  });

  console.log('Finalize models/block models');

  console.log('Update model "Page" (`page`)');
  await client.itemTypes.update(newItemTypes['2596445'], {
    title_field: newFields['13623255'],
  });

  console.log('Update model "Home" (`home`)');
  await client.itemTypes.update('2216253', {
    title_field: newFields['13623276'],
  });

  console.log('Manage menu items');

  console.log('Create menu item "Page"');
  newMenuItems['1569863'] = await client.menuItems.create({
    label: 'Page',
    item_type: newItemTypes['2596445'],
  });
}
