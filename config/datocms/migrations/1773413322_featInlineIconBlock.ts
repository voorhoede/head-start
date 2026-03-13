import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Create new models/block models');

  console.log('Create model "\uD83D\uDE98 Icon" (`icon`)');
  await client.itemTypes.create(
    {
      id: 'Z4kYvq4hS8GfdZh7JjfCBg',
      name: '\uD83D\uDE98 Icon',
      api_key: 'icon',
      draft_mode_active: false,
      draft_saving_active: false,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'GTSAeRbOSSSLySaXgUzUSA',
    },
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "Name" (`name`) in model "\uD83D\uDE98 Icon" (`icon`)',
  );
  await client.fields.create('Z4kYvq4hS8GfdZh7JjfCBg', {
    id: 'Qxinx0xxSbmTB8ywzAVgWA',
    label: 'Name',
    field_type: 'string',
    api_key: 'name',
    validators: { required: {}, enum: { values: ['external', 'share'] } },
    appearance: {
      addons: [],
      editor: 'string_select',
      parameters: {
        options: [
          { hint: '', label: 'External icon', value: 'external' },
          { hint: '', label: 'Share icon', value: 'share' },
        ],
      },
    },
    default_value: null,
  });

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Structured text field "Text" (`text`) in block model "\uD83D\uDCDD \uD83D\uDDBC\uFE0F Text Image Block" (`text_image_block`)',
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
      structured_text_inline_blocks: { item_types: [] },
      structured_text_links: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: [
          'GjWw8t-hTFaYYWyc53FeIg',
          'LjXdkuCdQxCFT4hv8_ayew',
          'X_tZn3TxQY28ltSyjZUGHQ',
          'Z4kYvq4hS8GfdZh7JjfCBg',
        ],
      },
    },
  });

  console.log(
    'Update Structured text field "Text" (`text`) in block model "\uD83D\uDCDD Text Block" (`text_block`)',
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
      structured_text_inline_blocks: { item_types: ['Yj11fFgoThKqLyKcqIg2Gg'] },
      structured_text_links: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: [
          'GjWw8t-hTFaYYWyc53FeIg',
          'LjXdkuCdQxCFT4hv8_ayew',
          'X_tZn3TxQY28ltSyjZUGHQ',
          'Z4kYvq4hS8GfdZh7JjfCBg',
        ],
      },
    },
  });

  console.log('Finalize models/block models');

  console.log('Update model "\uD83D\uDE98 Icon" (`icon`)');
  await client.itemTypes.update('Z4kYvq4hS8GfdZh7JjfCBg', {
    presentation_title_field: { id: 'Qxinx0xxSbmTB8ywzAVgWA', type: 'field' },
    title_field: { id: 'Qxinx0xxSbmTB8ywzAVgWA', type: 'field' },
  });

  console.log('Update permissions for environment in role Editor');
  await client.roles.updateCurrentEnvironmentPermissions('303748', {
    positive_item_type_permissions: {
      add: [
        {
          item_type: 'Z4kYvq4hS8GfdZh7JjfCBg',
          action: 'create',
          localization_scope: 'all',
        },
      ],
    },
    negative_item_type_permissions: {
      add: [
        {
          item_type: 'Z4kYvq4hS8GfdZh7JjfCBg',
          action: 'update',
          on_creator: 'anyone',
          localization_scope: 'all',
        },
        {
          item_type: 'Z4kYvq4hS8GfdZh7JjfCBg',
          action: 'delete',
          on_creator: 'anyone',
        },
      ],
    },
  });
}
