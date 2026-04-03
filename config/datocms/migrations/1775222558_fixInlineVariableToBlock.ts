import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Create new models/block models');

  console.log(
    'Create block model "\uD83D\uDD23 Variable Block" (`variable_block`)',
  );
  await client.itemTypes.create(
    {
      id: 'CNWKTKleQGeovku16xSa7A',
      name: '\uD83D\uDD23 Variable Block',
      api_key: 'variable_block',
      modular_block: true,
      draft_saving_active: false,
      hint: '',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'ZZL5mC51StWglS4FecsWgQ',
    },
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single link field "Variable" (`variable`) in block model "\uD83D\uDD23 Variable Block" (`variable_block`)',
  );
  await client.fields.create('CNWKTKleQGeovku16xSa7A', {
    id: 'Axr-8GliRJ6d-Vnca3LnAA',
    label: 'Variable',
    field_type: 'link',
    api_key: 'variable',
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: ['Weqp1brXRkSS-jZE8Z3HTw'],
      },
      required: {},
    },
    appearance: {
      addons: [],
      editor: 'link_select',
      parameters: { filters: [] },
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Display Title" (`display_title`) in model "\uD83D\uDD23 Variables" (`variable`)',
  );
  await client.fields.create('Weqp1brXRkSS-jZE8Z3HTw', {
    id: 'WOwho0PRRZC86nvwy5vGDg',
    label: 'Display Title',
    field_type: 'string',
    api_key: 'display_title',
    appearance: {
      addons: [],
      editor: 'EiyZ3d0SSDCPCNbsKBIwWQ',
      parameters: {
        hideField: false,
        editFunction: false,
        defaultFunction:
          'const titleValue = getFieldValue(datoCmsPlugin.formValues, \'title\');\nreturn `\uD83D\uDD23 ${titleValue}`;',
      },
      field_extension: 'computedFields',
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
          'Tv6MHewBS4evujN0EuSrwQ',
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
      structured_text_inline_blocks: { item_types: ['CNWKTKleQGeovku16xSa7A'] },
      structured_text_links: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: [
          'GjWw8t-hTFaYYWyc53FeIg',
          'LjXdkuCdQxCFT4hv8_ayew',
          'X_tZn3TxQY28ltSyjZUGHQ',
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
          'Tv6MHewBS4evujN0EuSrwQ',
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
      structured_text_inline_blocks: {
        item_types: ['CNWKTKleQGeovku16xSa7A', 'Yj11fFgoThKqLyKcqIg2Gg'],
      },
      structured_text_links: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: [
          'GjWw8t-hTFaYYWyc53FeIg',
          'LjXdkuCdQxCFT4hv8_ayew',
          'X_tZn3TxQY28ltSyjZUGHQ',
        ],
      },
    },
  });

  console.log(
    'Update Single-line string field "Value" (`value`) in model "\uD83D\uDD23 Variables" (`variable`)',
  );
  await client.fields.update('DihXGTqXQoia4qtLLVmuQA', {
    localized: true,
    default_value: { en: null, nl: null },
  });

  console.log('Finalize models/block models');

  console.log(
    'Update block model "\uD83D\uDD23 Variable Block" (`variable_block`)',
  );
  await client.itemTypes.update('CNWKTKleQGeovku16xSa7A', {
    presentation_title_field: { id: 'Axr-8GliRJ6d-Vnca3LnAA', type: 'field' },
  });

  console.log('Update model "\uD83D\uDD23 Variables" (`variable`)');
  await client.itemTypes.update('Weqp1brXRkSS-jZE8Z3HTw', {
    presentation_title_field: { id: 'WOwho0PRRZC86nvwy5vGDg', type: 'field' },
  });
}
