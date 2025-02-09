import type { Client, SimpleSchemaTypes } from '@datocms/cli/lib/cma-client-node';

export const actionStyleField: SimpleSchemaTypes.FieldCreateSchema = {
  label: 'Style',
  field_type: 'string',
  api_key: 'style',
  validators: {
    required: {},
    enum: { values: ['default', 'primary', 'secondary'] },
  },
  appearance: {
    addons: [],
    editor: 'string_select',
    parameters: {
      options: [
        { hint: '', label: 'Default action', value: 'default' },
        { hint: '', label: 'Primary action', value: 'primary' },
        { hint: '', label: 'Secondary action', value: 'secondary' },
      ],
    },
  },
  default_value: 'default',
};

export default async function (client: Client) {
  console.log('Create new models/block models');
  const home = await client.itemTypes.find('home_page');
  const page = await client.itemTypes.find('page');
  
  console.log(
    'Create block model "\uD83C\uDF9B\uFE0F Action Block" (`action_block`)'
  );
  await client.itemTypes.create(
    {
      id: 'F60ZY1wFSW2qbvh99poj3g',
      name: '\uD83C\uDF9B\uFE0F Action Block',
      api_key: 'action_block',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'aV5wDaZcRLaLFiNqBpNstw',
    }
  );

  console.log(
    'Create block model "\uD83D\uDD17 Internal Link" (`internal_link`)'
  );
  await client.itemTypes.create(
    {
      id: 'GWnhoQDqQoGJj4-sQTVttw',
      name: '\uD83D\uDD17 Internal Link',
      api_key: 'internal_link',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'aVOBPryiQ8O5EiHEHDEang',
    }
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Modular Content (Multiple blocks) field "Items" (`items`) in block model "\uD83C\uDF9B\uFE0F Action Block" (`action_block`)'
  );
  await client.fields.create('F60ZY1wFSW2qbvh99poj3g', {
    id: 'dAUckF8qR0edf_f7zam6hA',
    label: 'Items',
    field_type: 'rich_text',
    api_key: 'items',
    validators: {
      rich_text_blocks: { item_types: ['GWnhoQDqQoGJj4-sQTVttw'] },
      size: { min: 1 },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: true },
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "\uD83D\uDD17 Internal Link" (`internal_link`)'
  );
  await client.fields.create('GWnhoQDqQoGJj4-sQTVttw', {
    id: 'XTl0xPRsTpWg9zFauwDl5Q',
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
    'Create Single link field "Link" (`link`) in block model "\uD83D\uDD17 Internal Link" (`internal_link`)'
  );
  await client.fields.create('GWnhoQDqQoGJj4-sQTVttw', {
    id: 'bN5K_JObRQqv7tkzt4RG2w',
    label: 'Link',
    field_type: 'link',
    api_key: 'link',
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: [page.id, home.id],
      },
      required: {},
    },
    appearance: { addons: [], editor: 'link_select', parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Style" (`style`) in block model "\uD83D\uDD17 Internal Link" (`internal_link`)'
  );
  await client.fields.create('GWnhoQDqQoGJj4-sQTVttw', {
    id: 'S3JQgijhRmalePX3GeugPg',
    ...actionStyleField,
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
          'F60ZY1wFSW2qbvh99poj3g',
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
    'Update Modular Content (Multiple blocks) field "Body" (`blocks`) in model "\uD83D\uDCCE Page Partial" (`page_partial`)'
  );
  await client.fields.update('SKLmdv71Rge0rKhJzOFQWQ', {
    validators: {
      rich_text_blocks: {
        item_types: [
          'BRbU6VwTRgmG5SbwUs0rBg',
          'F60ZY1wFSW2qbvh99poj3g',
          'PAk40zGjQJCcDXXPgygUrA',
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
    },
  });

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`body_blocks`) in model "\uD83D\uDCD1 Page" (`page`)'
  );
  await client.fields.update('Q-z1nyMsQtC8Sr6w6J2oGw', {
    validators: {
      rich_text_blocks: {
        item_types: [
          'BRbU6VwTRgmG5SbwUs0rBg',
          'F60ZY1wFSW2qbvh99poj3g',
          'PAk40zGjQJCcDXXPgygUrA',
          'QYfZyBzIRWKxA1MinIR0aQ',
          'VZvVfu52RZK81WG0Dxp-FQ',
          'V80liDVtRC-UYgd3Sm-dXg',
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
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
          'F60ZY1wFSW2qbvh99poj3g',
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

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`body_blocks`) in model "\uD83C\uDFE0 Home" (`home_page`)'
  );
  await client.fields.update('pUj2PObgTyC-8X4lvZLMBA', {
    validators: {
      rich_text_blocks: {
        item_types: [
          'BRbU6VwTRgmG5SbwUs0rBg',
          'F60ZY1wFSW2qbvh99poj3g',
          'PAk40zGjQJCcDXXPgygUrA',
          'QYfZyBzIRWKxA1MinIR0aQ',
          'VZvVfu52RZK81WG0Dxp-FQ',
          'V80liDVtRC-UYgd3Sm-dXg',
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
    },
  });

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`body_blocks`) in model "\uD83E\uDD37 Not found" (`not_found_page`)'
  );
  await client.fields.update('Zu006Xq0TMCAvV-vyQ_Iiw', {
    validators: {
      rich_text_blocks: {
        item_types: [
          'BRbU6VwTRgmG5SbwUs0rBg',
          'F60ZY1wFSW2qbvh99poj3g',
          'PAk40zGjQJCcDXXPgygUrA',
          'QYfZyBzIRWKxA1MinIR0aQ',
          'VZvVfu52RZK81WG0Dxp-FQ',
          'V80liDVtRC-UYgd3Sm-dXg',
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
    },
  });
}
