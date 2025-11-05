import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) { 
  const appSettingsModel = await client.itemTypes.find('app');
  const pageModel = await client.itemTypes.find('page');
  
  const menuItemsField = await client.fields.find('app::menu_items');
    
  if (!appSettingsModel.singleton_item ) {
    throw new Error('"\uD83D\uDDA5\uFE0F Website" (`app`) singleton not found');
  }

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create fieldset "Special Purpose Pages" in model "\uD83D\uDDA5\uFE0F Website" (`app`)',
  );
  const specialPagesFieldset = await client.fieldsets.create(appSettingsModel.id, {
    title: 'Special Purpose Pages',
    hint: 'Select Pages to use for specific use cases.',
    collapsible: true,
    start_collapsed: true,
  });

  console.log(
    'Create fieldset "Menu" in model "\uD83D\uDDA5\uFE0F Website" (`app`)',
  );
  const menuFieldset = await client.fieldsets.create(appSettingsModel.id, {
    title: 'Menu',
    collapsible: true,
    start_collapsed: true,
  });

  console.log(
    'Create Single link field "Home" (`home_page`) in model "\uD83D\uDDA5\uFE0F Website" (`app`)',
  );
  const homePageField = await client.fields.create(appSettingsModel.id, {
    label: 'Home',
    field_type: 'link',
    api_key: 'home_page',
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'fail',
        on_reference_delete_strategy: 'fail',
        item_types: [pageModel.id],
      },
      required: {},
    },
    appearance: { addons: [], editor: 'link_embed', parameters: {} },
    default_value: null,
    fieldset: { id: specialPagesFieldset.id, type: 'fieldset' },
  });

  console.log(
    'Create Single link field "Not Found" (`not_found_page`) in model "\uD83D\uDDA5\uFE0F Website" (`app`)',
  );
  const notFoundField = await client.fields.create(appSettingsModel.id, {
    label: 'Not Found',
    field_type: 'link',
    api_key: 'not_found_page',
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'fail',
        on_reference_delete_strategy: 'fail',
        item_types: [pageModel.id],
      },
      required: {},
    },
    appearance: { addons: [], editor: 'link_embed', parameters: {} },
    default_value: null,
    fieldset: { id: specialPagesFieldset.id, type: 'fieldset' },
  });

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Modular Content (Multiple blocks) field "Menu Items" (`menu_items`) in model "\uD83D\uDDA5\uFE0F Website" (`app`)',
  );
  await client.fields.update(menuItemsField.id, {
    position: 0,
    fieldset: { id: menuFieldset.id, type: 'fieldset' },
  });

  console.log(
    'Update fieldset "Menu" in model "\uD83D\uDDA5\uFE0F Website" (`app`)',
  );
  await client.fieldsets.update(menuFieldset.id, { position: 1 });

  console.log(
    'Update fieldset "Special Purpose Pages" in model "\uD83D\uDDA5\uFE0F Website" (`app`)',
  );
  await client.fieldsets.update(specialPagesFieldset.id, { position: 2 });

  console.log(
    'Update Single link field "Home" (`home_page`) in model "\uD83D\uDDA5\uFE0F Website" (`app`)',
  );
  await client.fields.update(homePageField.id, { position: 0 });

  console.log(
    'Update Single link field "Not Found" (`not_found_page`) in model "\uD83D\uDDA5\uFE0F Website" (`app`)',
  );
  await client.fields.update(notFoundField.id, { position: 1 });
  
  console.log(
    'Update Slug field "Slug" (`slug`) in model "\uD83D\uDCD1 Page" (`page`)',
  );
  await client.fields.update('page::slug', {
    hint: 'For the Home Page only, the value of this field is ignored. <br />View the \uD83D\uDDA5\uFE0F Website settings to specify which Page is used as the Home Page.',
  });
}
