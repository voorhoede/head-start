import type { Client, SimpleSchemaTypes } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newItemTypes: Record<string, SimpleSchemaTypes.ItemType> = {};
  const newMenuItems: Record<string, SimpleSchemaTypes.MenuItem> = {};

  console.log('Create new models/block models');

  console.log('Create model "Not found" (`not_found`)');
  newItemTypes['2776649'] = await client.itemTypes.create(
    {
      name: 'Not found',
      singleton: true,
      api_key: 'not_found',
      draft_mode_active: true,
      all_locales_required: true,
      collection_appearance: 'table',
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true }
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "Title" (`title`) in model "Not found" (`not_found`)'
  );
  newFields['14562162'] = await client.fields.create(newItemTypes['2776649'], {
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    localized: true,
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false },
    },
    default_value: { en: '', nl: '' },
  });

  console.log(
    'Create SEO meta tags field "SEO" (`seo`) in model "Not found" (`not_found`)'
  );
  newFields['14562164'] = await client.fields.create(newItemTypes['2776649'], {
    label: 'SEO',
    field_type: 'seo',
    api_key: 'seo',
    localized: true,
    validators: { title_length: { max: 60 }, description_length: { max: 160 } },
    appearance: { addons: [], editor: 'seo', parameters: {} },
  });

  console.log('Finalize models/block models');

  console.log('Update model "Not found" (`not_found`)');
  await client.itemTypes.update(newItemTypes['2776649'], {
    title_field: newFields['14562162'],
  });

  console.log('Manage menu items');

  console.log('Create menu item "404"');
  newMenuItems['1690698'] = await client.menuItems.create({
    label: '404',
    item_type: newItemTypes['2776649'],
  });
}
