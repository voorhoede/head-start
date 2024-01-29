import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Create new models/block models');

  console.log('Create block model "\uD83C\uDFAC Video Block" (`video_block`)');
  await client.itemTypes.create(
    {
      // @ts-expect-error next-line DatoCMS auto-generated
      id: 'QYfZyBzIRWKxA1MinIR0aQ',
      name: '\uD83C\uDFAC Video Block',
      api_key: 'video_block',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true }
  );

  console.log(
    'Create model "\uD83D\uDD21 Video Text Track" (`video_text_track`)'
  );
  await client.itemTypes.create(
    {
      // @ts-expect-error next-line DatoCMS auto-generated
      id: 'Us90isT5SgeXHuetcEj8eA',
      name: '\uD83D\uDD21 Video Text Track',
      api_key: 'video_text_track',
      collection_appearance: 'table',
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true }
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single asset field "Video" (`video_asset`) in block model "\uD83C\uDFAC Video Block" (`video_block`)'
  );
  await client.fields.create('QYfZyBzIRWKxA1MinIR0aQ', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'KdXhYelkQdaepb_wpK7yuw',
    label: 'Video',
    field_type: 'file',
    api_key: 'video_asset',
    validators: { required: {} },
    appearance: { addons: [], editor: 'file', parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "\uD83C\uDFAC Video Block" (`video_block`)'
  );
  await client.fields.create('QYfZyBzIRWKxA1MinIR0aQ', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'CYYGKtnXSkiSCTYMrOI3Yg',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    hint: 'Optional title. By default the title from the selected video is used.',
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false },
    },
    default_value: '',
  });

  console.log(
    'Create Boolean field "Autoplay" (`autoplay`) in block model "\uD83C\uDFAC Video Block" (`video_block`)'
  );
  await client.fields.create('QYfZyBzIRWKxA1MinIR0aQ', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'SEULcq3NS06_pDVrsHxiUA',
    label: 'Autoplay',
    field_type: 'boolean',
    api_key: 'autoplay',
    hint: 'Note: video will only autoplay if device supports it and user has consented to 3rd party content.',
    appearance: { addons: [], editor: 'boolean', parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Boolean field "Mute" (`mute`) in block model "\uD83C\uDFAC Video Block" (`video_block`)'
  );
  await client.fields.create('QYfZyBzIRWKxA1MinIR0aQ', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'YaS-9DSqS3umFlirmXcOkw',
    label: 'Mute',
    field_type: 'boolean',
    api_key: 'mute',
    appearance: { addons: [], editor: 'boolean', parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Boolean field "Loop" (`loop`) in block model "\uD83C\uDFAC Video Block" (`video_block`)'
  );
  await client.fields.create('QYfZyBzIRWKxA1MinIR0aQ', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'AsETx2yITvOK2QKbu8bYRw',
    label: 'Loop',
    field_type: 'boolean',
    api_key: 'loop',
    appearance: { addons: [], editor: 'boolean', parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Multiple links field "Tracks" (`tracks`) in block model "\uD83C\uDFAC Video Block" (`video_block`)'
  );
  await client.fields.create('QYfZyBzIRWKxA1MinIR0aQ', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'WVz9yVpWSymoFxO4oKzzeA',
    label: 'Tracks',
    field_type: 'links',
    api_key: 'tracks',
    hint: 'For accessibility, videos should provide both captions and transcripts that accurately describe its content. Captions allow people who are experiencing hearing loss to understand a video\'s audio content as the video is being played, while transcripts allow people who need additional time to be able to review audio content at a pace and format that is comfortable for them.',
    validators: {
      items_item_type: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: ['Us90isT5SgeXHuetcEj8eA'],
      },
    },
    appearance: { addons: [], editor: 'links_embed', parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in model "\uD83D\uDD21 Video Text Track" (`video_text_track`)'
  );
  await client.fields.create('Us90isT5SgeXHuetcEj8eA', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'GzfEVsO6QnOu2KRUaPhc5Q',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    hint: 'A user-readable title of the text track which is used by the browser when listing available text tracks. Defaults to selected language name (English, Deutsch, etc) when empty.',
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false },
    },
    default_value: '',
  });

  console.log(
    'Create Single-line string field "Locale" (`locale`) in model "\uD83D\uDD21 Video Text Track" (`video_text_track`)'
  );
  await client.fields.create('Us90isT5SgeXHuetcEj8eA', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'AD-nA46KQc2wL8978d6asg',
    label: 'Locale',
    field_type: 'string',
    api_key: 'locale',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'string_select',
      parameters: {
        options: [
          { hint: '', label: 'Deutsch', value: 'de' },
          { hint: '', label: 'English', value: 'en' },
          { hint: '', label: 'Espa\u00F1ol', value: 'es' },
          { hint: '', label: 'Fran\u00E7ais', value: 'fr' },
          { hint: '', label: 'Italiano', value: 'it' },
          { hint: '', label: 'Nederlands', value: 'nl' },
        ],
      },
    },
    default_value: '',
  });

  console.log(
    'Create Single-line string field "Kind" (`kind`) in model "\uD83D\uDD21 Video Text Track" (`video_text_track`)'
  );
  await client.fields.create('Us90isT5SgeXHuetcEj8eA', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'F7QOFgNLStmPAdNlSn7uuQ',
    label: 'Kind',
    field_type: 'string',
    api_key: 'kind',
    hint: 'How the text track is meant to be used.',
    validators: {
      required: {},
      enum: {
        values: [
          'subtitles',
          'captions',
          'descriptions',
          'chapters',
          'metadata',
        ],
      },
    },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false },
    },
    default_value: 'subtitles',
  });

  console.log(
    'Create Single asset field "File" (`file`) in model "\uD83D\uDD21 Video Text Track" (`video_text_track`)'
  );
  await client.fields.create('Us90isT5SgeXHuetcEj8eA', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'XNFlO-LWQJiMDd5r44PaKw',
    label: 'File',
    field_type: 'file',
    api_key: 'file',
    validators: { required: {}, extension: { extensions: ['vtt'] } },
    appearance: { addons: [], editor: 'file', parameters: {} },
    default_value: null,
  });

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Modular content field "Body" (`body_blocks`) in model "Home" (`home`)'
  );
  await client.fields.update('pUj2PObgTyC-8X4lvZLMBA', {
    validators: {
      rich_text_blocks: {
        item_types: [
          'BRbU6VwTRgmG5SbwUs0rBg',
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
    'Update Modular content field "Body" (`body_blocks`) in model "Page" (`page`)'
  );
  await client.fields.update('Q-z1nyMsQtC8Sr6w6J2oGw', {
    validators: {
      rich_text_blocks: {
        item_types: [
          'BRbU6VwTRgmG5SbwUs0rBg',
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
    'Update Structured text field "Text" (`text`) in block model "Text Block" (`text_block`)'
  );
  await client.fields.update('NtVXfZ6gTL2sKNffNeUf5Q', {
    validators: {
      required: {},
      structured_text_blocks: {
        item_types: [
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
        item_types: ['WywlzYXpSVWFQIeeNk3iMw'],
      },
    },
  });

  console.log('Finalize models/block models');

  console.log(
    'Update model "\uD83D\uDD21 Video Text Track" (`video_text_track`)'
  );
  await client.itemTypes.update('Us90isT5SgeXHuetcEj8eA', {
    title_field: { id: 'AD-nA46KQc2wL8978d6asg', type: 'field' },
    image_preview_field: { id: 'XNFlO-LWQJiMDd5r44PaKw', type: 'field' },
  });
}
