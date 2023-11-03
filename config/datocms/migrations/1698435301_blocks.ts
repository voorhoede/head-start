import type { Client, SimpleSchemaTypes } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newItemTypes: Record<string, SimpleSchemaTypes.ItemType> = {};
  const newPlugins: Record<string, SimpleSchemaTypes.Plugin> = {};
  const newMenuItems: Record<string, SimpleSchemaTypes.MenuItem> = {};

  console.log('Manage upload filters');

  console.log('Install plugin "Table Editor"');
  newPlugins['pbUJSKRiTYekw2fYExcmIw'] = await client.plugins.create({
    package_name: 'datocms-plugin-table-editor',
  });

  console.log('Create new models/block models');

  console.log('Create model "Schema migration" (`schema_migration`)');
  newItemTypes['f64W6P6fRRu4Xv-YZRkcfA'] = await client.itemTypes.create(
    {
      name: 'Schema migration',
      api_key: 'schema_migration',
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true }
  );

  console.log('Create block model "Text Block" (`text_block`)');
  newItemTypes['PAk40zGjQJCcDXXPgygUrA'] = await client.itemTypes.create(
    {
      name: 'Text Block',
      api_key: 'text_block',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true }
  );

  console.log('Create block model "Table Block" (`table_block`)');
  newItemTypes['0SxYNS2CR1it_5LHYWuEQg'] = await client.itemTypes.create(
    {
      name: 'Table Block',
      api_key: 'table_block',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true }
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "Migration file name" (`name`) in model "Schema migration" (`schema_migration`)'
  );
  newFields['4oUxvLszRlSf25gAplT9vA'] = await client.fields.create(
    newItemTypes['f64W6P6fRRu4Xv-YZRkcfA'],
    {
      label: 'Migration file name',
      field_type: 'string',
      api_key: 'name',
      validators: { required: {} },
      appearance: {
        addons: [],
        editor: 'single_line',
        parameters: { heading: false },
      },
      default_value: '',
    }
  );

  console.log(
    'Create Structured text field "Text" (`text`) in block model "Text Block" (`text_block`)'
  );
  newFields['NtVXfZ6gTL2sKNffNeUf5Q'] = await client.fields.create(
    newItemTypes['PAk40zGjQJCcDXXPgygUrA'],
    {
      label: 'Text',
      field_type: 'structured_text',
      api_key: 'text',
      validators: {
        required: {},
        structured_text_blocks: { item_types: [] },
        structured_text_links: {
          on_publish_with_unpublished_references_strategy: 'fail',
          on_reference_unpublish_strategy: 'delete_references',
          on_reference_delete_strategy: 'delete_references',
          item_types: [],
        },
      },
      appearance: {
        addons: [],
        editor: 'structured_text',
        parameters: {
          marks: [
            'strong',
            'code',
            'emphasis',
            'underline',
            'strikethrough',
            'highlight',
          ],
          nodes: [
            'blockquote',
            'code',
            'heading',
            'link',
            'list',
            'thematicBreak',
          ],
          heading_levels: [2, 3, 4, 5, 6],
          blocks_start_collapsed: false,
          show_links_meta_editor: false,
          show_links_target_blank: true,
        },
      },
      default_value: null,
    }
  );

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "Table Block" (`table_block`)'
  );
  newFields['rCvzxtqpRJWdlSE8xH2plQ'] = await client.fields.create(
    newItemTypes['0SxYNS2CR1it_5LHYWuEQg'],
    {
      label: 'Title',
      field_type: 'string',
      api_key: 'title',
      appearance: {
        addons: [],
        editor: 'single_line',
        parameters: { heading: false },
      },
      default_value: '',
    }
  );

  console.log(
    'Create JSON field "Table" (`table`) in block model "Table Block" (`table_block`)'
  );
  newFields['ZpBMws8EQW2inOBtyVLgoA'] = await client.fields.create(
    newItemTypes['0SxYNS2CR1it_5LHYWuEQg'],
    {
      label: 'Table',
      field_type: 'json',
      api_key: 'table',
      validators: { required: {} },
      appearance: {
        addons: [],
        editor: newPlugins['pbUJSKRiTYekw2fYExcmIw'].id,
        parameters: {},
        field_extension: 'table',
      },
      default_value: null,
    }
  );

  console.log(
    'Create Modular content field "Body" (`body_blocks`) in model "Home" (`home`)'
  );
  newFields['pUj2PObgTyC-8X4lvZLMBA'] = await client.fields.create('2216253', {
    label: 'Body',
    field_type: 'rich_text',
    api_key: 'body_blocks',
    localized: true,
    validators: {
      rich_text_blocks: {
        item_types: [
          newItemTypes['PAk40zGjQJCcDXXPgygUrA'].id,
          newItemTypes['0SxYNS2CR1it_5LHYWuEQg'].id,
        ],
      },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: true },
    },
  });

  console.log(
    'Create Modular content field "Body" (`body_blocks`) in model "Page" (`page`)'
  );
  newFields['Q-z1nyMsQtC8Sr6w6J2oGw'] = await client.fields.create('2596445', {
    label: 'Body',
    field_type: 'rich_text',
    api_key: 'body_blocks',
    localized: true,
    validators: {
      rich_text_blocks: {
        item_types: [
          newItemTypes['PAk40zGjQJCcDXXPgygUrA'].id,
          newItemTypes['0SxYNS2CR1it_5LHYWuEQg'].id,
        ],
      },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: true },
    },
  });

  console.log('Finalize models/block models');

  console.log('Update model "Schema migration" (`schema_migration`)');
  await client.itemTypes.update(newItemTypes['f64W6P6fRRu4Xv-YZRkcfA'], {
    title_field: newFields['4oUxvLszRlSf25gAplT9vA'],
  });

  console.log('Manage menu items');

  console.log('Create menu item "Schema migration"');
  newMenuItems['NCW3JSnoTgWVSSTaf4iBYw'] = await client.menuItems.create({
    label: 'Schema migration',
    item_type: newItemTypes['f64W6P6fRRu4Xv-YZRkcfA'],
  });
}
