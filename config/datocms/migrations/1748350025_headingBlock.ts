import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  //@ts-expect-error rich_text_blocks is only available on Modular Content fields
  const homeBodyBlocks = (await client.fields.find('home_page::body_blocks')).validators.rich_text_blocks?.item_types;
  //@ts-expect-error rich_text_blocks is only available on Modular Content fields
  const pageBodyBlocks = (await client.fields.find('page::body_blocks')).validators.rich_text_blocks?.item_types;
  //@ts-expect-error rich_text_blocks is only available on Modular Content fields
  const notFoundPageBodyBlocks = (await client.fields.find('not_found_page::body_blocks')).validators.rich_text_blocks?.item_types;
  //@ts-expect-error rich_text_blocks is only available on Modular Content fields
  const pagePartialBlocks = (await client.fields.find('page_partial::blocks')).validators.rich_text_blocks?.item_types;

  //@ts-expect-error rich_text_blocks is only available on Modular Content fields
  const groupingItemBlocks = (await client.fields.find('grouping_item::blocks')).validators.rich_text_blocks?.item_types;
  const textBlockText = (await client.fields.find('text_block::text'));
  const textImageBlocksText = (await client.fields.find('text_image_block::text'));

  console.log(
    'Create block model "#\uFE0F\u20E3 Heading Block" (`heading_block`)'
  );
  const headingBlock = await client.itemTypes.create(
    {
      id: 'BQFNgVsiRMO2N618F-cyxA',
      name: '#\uFE0F\u20E3 Heading Block',
      api_key: 'heading_block',
      modular_block: true,
      draft_saving_active: false,
      hint: 'A heading is a description of the content it precedes.',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'LnqHRudOSA-2lvv3dqmoOQ',
    }
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Structured text field "Text" (`text`) in block model "#\uFE0F\u20E3 Heading Block" (`heading_block`)'
  );
  const headingBlockText = await client.fields.create(headingBlock.id, {
    id: 'N3DsL75WSTqZINhfJip76A',
    label: 'Text',
    field_type: 'structured_text',
    api_key: 'text',
    validators: {
      required: {},
      structured_text_blocks: { item_types: [] },
      structured_text_inline_blocks: { item_types: [] },
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
          'code',
          'emphasis',
          'highlight',
          'strikethrough',
          'strong',
          'underline',
        ],
        nodes: ['heading'],
        heading_levels: [1, 2, 3, 4, 5, 6],
        blocks_start_collapsed: false,
        show_links_meta_editor: false,
        show_links_target_blank: true,
      },
    },
    default_value: null,
  });

  console.log(
    'Create Integer number field "Level" (`level`) in block model "#\uFE0F\u20E3 Heading Block" (`heading_block`)'
  );
  await client.fields.create(headingBlock.id, {
    id: 'II0R4VTcSoi-szQ0s-zkBQ',
    label: 'Level',
    field_type: 'integer',
    api_key: 'level',
    hint: 'Optional heading level',
    validators: { number_range: { min: 2, max: 6 } },
    appearance: {
      addons: [],
      editor: 'integer',
      parameters: { placeholder: null },
    },
    default_value: null,
  });

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`blocks`) in model "\uD83E\uDDE9 Page Partial" (`page_partial`)'
  );
  await client.fields.update('SKLmdv71Rge0rKhJzOFQWQ', {
    validators: {
      rich_text_blocks: {
        item_types: [
          ...pagePartialBlocks,
          headingBlock.id,
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
          ...pageBodyBlocks,
          headingBlock.id,
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
          ...homeBodyBlocks,
          headingBlock.id,
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
          ...notFoundPageBodyBlocks,
          headingBlock.id,
        ],
      },
    },
  });

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`blocks`) in block model "\uD83D\uDDC2\uFE0F Grouping Item" (`grouping_item`)'
  );
  await client.fields.update('NTDc3vtCRzO5mEsE3gfmOQ', {
    validators: {
      rich_text_blocks: {
        item_types: [
          ...groupingItemBlocks,
          headingBlock.id,
        ],
      },
      size: { min: 1 },
    },
  });
  
  console.log(
    'Update Structured text field "Text" (`text`) in block model "\uD83D\uDCDD \uD83D\uDDBC\uFE0F Text Image Block" (`text_image_block`)'
  );
  await client.fields.update(textImageBlocksText.id, {
    validators: {
      ...textImageBlocksText.validators,
      structured_text_blocks: {
        item_types: [
          //@ts-expect-error structured_text_blocks only available on structured text fields
          ...textImageBlocksText.validators?.structured_text_blocks?.item_types || {},
          headingBlock.id,
        ],
      },
    },
  });
  
  console.log(
    'Update Structured text field "Text" (`text`) in block model "\uD83D\uDCDD Text Block" (`text_block`)'
  );
  await client.fields.update(textBlockText.id, {
    validators: {
      ...textBlockText.validators,
      structured_text_blocks: {
        item_types: [
          //@ts-expect-error structured_text_blocks only available on structured text fields
          ...textBlockText.validators?.structured_text_blocks?.item_types || {},
          headingBlock.id,
        ],
      },
    },
  });

  console.log('Finalize models/block models');

  console.log(
    'Update block model "#\uFE0F\u20E3 Heading Block" (`heading_block`)'
  );
  await client.itemTypes.update(headingBlock.id, {
    presentation_title_field: { id: headingBlockText.id, type: 'field' },
    presentation_image_field: null,
  });
}
