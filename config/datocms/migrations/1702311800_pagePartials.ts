import { Client, SimpleSchemaTypes } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newItemTypes: Record<string, SimpleSchemaTypes.ItemType> = {};

  console.log('Create new models/block models');

  console.log('Create model "Page Partial" (`page_partial`)');
  newItemTypes['DAdmJVaoTZKumF9GYBZDfQ'] = await client.itemTypes.create(
    {
      name: 'Page Partial',
      api_key: 'page_partial',
      collection_appearance: 'table',
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true }
  );

  console.log('Create block model "Page Partial Block" (`page_partial_block`)');
  newItemTypes['V80liDVtRC-UYgd3Sm-dXg'] = await client.itemTypes.create(
    {
      name: 'Page Partial Block',
      api_key: 'page_partial_block',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true }
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "Title" (`title`) in model "Page Partial" (`page_partial`)'
  );
  newFields['UFrvDLVxQju6Z35XHzuENQ'] = await client.fields.create(
    newItemTypes['DAdmJVaoTZKumF9GYBZDfQ'],
    {
      label: 'Title',
      field_type: 'string',
      api_key: 'title',
      hint: 'This title is only used in the CMS, so you can find a page partial you want to reuse.',
      localized: true,
      validators: { required: {} },
      appearance: {
        addons: [],
        editor: 'single_line',
        parameters: { heading: true },
        type: 'title',
      },
      default_value: { en: '', nl: '' },
    }
  );

  console.log(
    'Create Modular content field "Body" (`blocks`) in model "Page Partial" (`page_partial`)'
  );
  newFields['SKLmdv71Rge0rKhJzOFQWQ'] = await client.fields.create(
    newItemTypes['DAdmJVaoTZKumF9GYBZDfQ'],
    {
      label: 'Body',
      field_type: 'rich_text',
      api_key: 'blocks',
      localized: true,
      validators: {
        rich_text_blocks: {
          item_types: [
            newItemTypes['BRbU6VwTRgmG5SbwUs0rBg'].id,
            'PAk40zGjQJCcDXXPgygUrA',
            'ZdBokLsWRgKKjHrKeJzdpw',
            'gezG9nO7SfaiWcWnp-HNqw',
            '0SxYNS2CR1it_5LHYWuEQg',
          ],
        },
      },
      appearance: {
        addons: [],
        editor: 'rich_text',
        parameters: { start_collapsed: true },
      },
    }
  );

  console.log(
    'Create Multiple links field "Items" (`items`) in block model "Page Partial Block" (`page_partial_block`)'
  );
  newFields['UgwMgWgIRPS-nqcdJdQYIg'] = await client.fields.create(
    newItemTypes['V80liDVtRC-UYgd3Sm-dXg'],
    {
      label: 'Items',
      field_type: 'links',
      api_key: 'items',
      validators: {
        items_item_type: {
          on_publish_with_unpublished_references_strategy: 'fail',
          on_reference_unpublish_strategy: 'delete_references',
          on_reference_delete_strategy: 'delete_references',
          item_types: [newItemTypes['DAdmJVaoTZKumF9GYBZDfQ'].id],
        },
        size: { min: 1 },
      },
      appearance: { addons: [], editor: 'links_embed', parameters: {} },
      default_value: null,
    }
  );

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Modular content field "Body" (`body_blocks`) in model "Home" (`home`)'
  );
  await client.fields.update('pUj2PObgTyC-8X4lvZLMBA', {
    validators: {
      rich_text_blocks: {
        item_types: [
          newItemTypes['BRbU6VwTRgmG5SbwUs0rBg'].id,
          'PAk40zGjQJCcDXXPgygUrA',
          newItemTypes['V80liDVtRC-UYgd3Sm-dXg'].id,
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
    },
  });

  console.log(
    'Update Modular content field "Body" (`body_blocks`) in model "Page" (`page`)'
  );
  await client.fields.update('Q-z1nyMsQtC8Sr6w6J2oGw', {
    validators: {
      rich_text_blocks: {
        item_types: [
          newItemTypes['BRbU6VwTRgmG5SbwUs0rBg'].id,
          'PAk40zGjQJCcDXXPgygUrA',
          newItemTypes['V80liDVtRC-UYgd3Sm-dXg'].id,
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
    },
  });

  console.log('Finalize models/block models');

  console.log('Update model "Page Partial" (`page_partial`)');
  await client.itemTypes.update(newItemTypes['DAdmJVaoTZKumF9GYBZDfQ'], {
    title_field: newFields['UFrvDLVxQju6Z35XHzuENQ'],
  });
}
