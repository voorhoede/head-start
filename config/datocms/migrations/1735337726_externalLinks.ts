import type { Client } from '@datocms/cli/lib/cma-client-node';
import { actionStyleField } from './1734363388_actionBlock';

export default async function (client: Client) {
  console.log('Create new models/block models');

  console.log(
    'Create block model "\uD83D\uDD17 External Link" (`external_link`)'
  );
  await client.itemTypes.create(
    {
      id: 'Yk1ge9eTTf25Iwph1Dx3_g',
      name: '\uD83D\uDD17 External Link',
      api_key: 'external_link',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'OiBwyNPrR82ZWMawg47csg',
    }
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "\uD83D\uDD17 External Link" (`external_link`)'
  );
  await client.fields.create('Yk1ge9eTTf25Iwph1Dx3_g', {
    id: 'Epmmtd7MTfeqpiwLP23D1Q',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log(
    'Create Single-line string field "URL" (`url`) in block model "\uD83D\uDD17 External Link" (`external_link`)'
  );
  await client.fields.create('Yk1ge9eTTf25Iwph1Dx3_g', {
    id: 'bUvYLCENQ3SP_vGhoN07nA',
    label: 'URL',
    field_type: 'string',
    api_key: 'url',
    validators: { required: {}, format: { predefined_pattern: 'url' } },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log(
    'Create Boolean field "Open in new tab" (`open_in_new_tab`) in block model "\uD83D\uDD17 External Link" (`external_link`)'
  );
  await client.fields.create('Yk1ge9eTTf25Iwph1Dx3_g', {
    id: 'AlPRQFQdRlixBp4Tgz5qsQ',
    label: 'Open in new tab',
    field_type: 'boolean',
    api_key: 'open_in_new_tab',
    appearance: { addons: [], editor: 'boolean', parameters: {} },
    default_value: false,
  });

  console.log(
    'Create Single-line string field "Style" (`style`) in block model "\uD83D\uDD17 External Link" (`external_link`)'
  );
  await client.fields.create('Yk1ge9eTTf25Iwph1Dx3_g', {
    id: 'TNl63OntSe6ZLD3wCYxK-g',
    ...actionStyleField,
  });

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Modular Content (Multiple blocks) field "Items" (`items`) in block model "\uD83C\uDF9B\uFE0F Action Block" (`action_block`)'
  );
  await client.fields.update('dAUckF8qR0edf_f7zam6hA', {
    validators: {
      rich_text_blocks: {
        item_types: ['GWnhoQDqQoGJj4-sQTVttw', 'Yk1ge9eTTf25Iwph1Dx3_g'],
      },
      size: { min: 1 },
    },
  });
}
