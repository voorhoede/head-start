import type { Client, SimpleSchemaTypes } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newItemTypes: Record<string, SimpleSchemaTypes.ItemType> = {};

  console.log('Create new models/block models');

  console.log('Create block model "Text Image Block" (`text_image_block`)');
  newItemTypes['BRbU6VwTRgmG5SbwUs0rBg'] = await client.itemTypes.create(
    {
      name: 'Text Image Block',
      api_key: 'text_image_block',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true }
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Structured text field "Text" (`text`) in block model "Text Image Block" (`text_image_block`)'
  );
  newFields['V4dMfrWsQ027JYEp6q3KhA'] = await client.fields.create(
    newItemTypes['BRbU6VwTRgmG5SbwUs0rBg'],
    {
      label: 'Text',
      field_type: 'structured_text',
      api_key: 'text',
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
          item_types: ['WywlzYXpSVWFQIeeNk3iMw'],
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
    'Create Single asset field "Image" (`image`) in block model "Text Image Block" (`text_image_block`)'
  );
  newFields['FubZXQtGR2ir_2G6-1fJtQ'] = await client.fields.create(
    newItemTypes['BRbU6VwTRgmG5SbwUs0rBg'],
    {
      label: 'Image',
      field_type: 'file',
      api_key: 'image',
      validators: {
        required: {},
        extension: { extensions: [], predefined_list: 'image' },
        required_alt_title: { title: false, alt: true },
      },
      appearance: { addons: [], editor: 'file', parameters: {} },
      default_value: null,
    }
  );

  console.log(
    'Create Single-line string field "Layout" (`layout`) in block model "Text Image Block" (`text_image_block`)'
  );
  newFields['Ejw-eeKDTPWU-2EUtowmYg'] = await client.fields.create(
    newItemTypes['BRbU6VwTRgmG5SbwUs0rBg'],
    {
      label: 'Layout',
      field_type: 'string',
      api_key: 'layout',
      validators: {
        required: {},
        enum: { values: ['text-image', 'image-text'] },
      },
      appearance: {
        addons: [],
        editor: 'single_line',
        parameters: { heading: false },
      },
      default_value: '',
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
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
    },
  });
}
