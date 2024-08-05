import {
  Client,
  type SimpleSchemaTypes,
} from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newItemTypes: Record<string, SimpleSchemaTypes.ItemType> = {};
  const newMenuItems: Record<string, SimpleSchemaTypes.MenuItem> = {};
  const plugins = await client.plugins.list();

  console.log('Manage upload filters');

  console.log('Create new models/block models');

  console.log('Create model "\uD83C\uDFE0 Home" (`home_page`)');
  newItemTypes['2216253'] = await client.itemTypes.create(
    {
      name: '\uD83C\uDFE0 Home',
      singleton: true,
      api_key: 'home_page',
      draft_mode_active: true,
      all_locales_required: true,
      collection_appearance: 'table',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'C_h7C4d4S9OgdoNashMkMg',
    },
  );

  console.log('Create model "\uD83D\uDCD1 Page" (`page`)');
  newItemTypes['2596445'] = await client.itemTypes.create(
    {
      name: '\uD83D\uDCD1 Page',
      api_key: 'page',
      draft_mode_active: true,
      collection_appearance: 'table',
      inverse_relationships_enabled: true,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'TRxEUOYDR2mQc4z-mJx6vA',
    },
  );

  console.log('Create model "\uD83E\uDD37 Not found" (`not_found_page`)');
  newItemTypes['2776649'] = await client.itemTypes.create(
    {
      name: '\uD83E\uDD37 Not found',
      singleton: true,
      api_key: 'not_found_page',
      draft_mode_active: true,
      all_locales_required: true,
      collection_appearance: 'table',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'ODF9lHbpQIOMZixGtYPJcQ',
    },
  );

  console.log('Create block model "Text Image Block" (`text_image_block`)');
  await client.itemTypes.create(
    {
      id: 'BRbU6VwTRgmG5SbwUs0rBg',
      name: 'Text Image Block',
      api_key: 'text_image_block',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'L902iSjzTZipvW76jOeYIA',
    },
  );

  console.log('Create model "Page Partial" (`page_partial`)');
  await client.itemTypes.create(
    {
      id: 'DAdmJVaoTZKumF9GYBZDfQ',
      name: 'Page Partial',
      api_key: 'page_partial',
      collection_appearance: 'table',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'G_mo5y-tQX6ITTAVSuHwVQ',
    },
  );

  console.log('Create block model "\uD83D\uDCDD Text Block" (`text_block`)');
  await client.itemTypes.create(
    {
      id: 'PAk40zGjQJCcDXXPgygUrA',
      name: '\uD83D\uDCDD Text Block',
      api_key: 'text_block',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'QLOjKvs7TIifnh0jFHYRpA',
    },
  );

  console.log('Create block model "\uD83C\uDFAC Video Block" (`video_block`)');
  await client.itemTypes.create(
    {
      id: 'QYfZyBzIRWKxA1MinIR0aQ',
      name: '\uD83C\uDFAC Video Block',
      api_key: 'video_block',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'bhztsYOFREu2zgi6Av5ZTQ',
    },
  );

  console.log(
    'Create model "\uD83D\uDD21 Video Text Track" (`video_text_track`)',
  );
  await client.itemTypes.create(
    {
      id: 'Us90isT5SgeXHuetcEj8eA',
      name: '\uD83D\uDD21 Video Text Track',
      api_key: 'video_text_track',
      collection_appearance: 'table',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'HljEN8uWSY6BHxJ-iIx4ig',
    },
  );

  console.log('Create block model "Embed Block" (`embed_block`)');
  await client.itemTypes.create(
    {
      id: 'VZvVfu52RZK81WG0Dxp-FQ',
      name: 'Embed Block',
      api_key: 'embed_block',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'MIWhZ6URT461Va6suQrU0Q',
    },
  );

  console.log('Create block model "Page Partial Block" (`page_partial_block`)');
  await client.itemTypes.create(
    {
      id: 'V80liDVtRC-UYgd3Sm-dXg',
      name: 'Page Partial Block',
      api_key: 'page_partial_block',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'PZzg8ydcT0a8HStzchUF6w',
    },
  );

  console.log('Create model "Internal link" (`internal_link`)');
  await client.itemTypes.create(
    {
      id: 'WywlzYXpSVWFQIeeNk3iMw',
      name: 'Internal link',
      api_key: 'internal_link',
      collection_appearance: 'table',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'Ua0dofS1SXS2tTj14jcwTg',
    },
  );

  console.log(
    'Create block model "\uD83D\uDDBC\uFE0F Image Block" (`image_block`)',
  );
  await client.itemTypes.create(
    {
      id: 'ZdBokLsWRgKKjHrKeJzdpw',
      name: '\uD83D\uDDBC\uFE0F Image Block',
      api_key: 'image_block',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'fB8nvvdwQVSuncWPedJ4JQ',
    },
  );

  console.log(
    'Create block model "\uD83C\uDFAC Video Embed Block" (`video_embed_block`)',
  );
  await client.itemTypes.create(
    {
      id: 'gezG9nO7SfaiWcWnp-HNqw',
      name: '\uD83C\uDFAC Video Embed Block',
      api_key: 'video_embed_block',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'ZidgZpjxQJOa0Yvl2DFzdg',
    },
  );

  console.log('Create block model "Table Block" (`table_block`)');
  await client.itemTypes.create(
    {
      id: '0SxYNS2CR1it_5LHYWuEQg',
      name: 'Table Block',
      api_key: 'table_block',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'DQCIP-i7SzCbmCKHeZOVmQ',
    },
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "Title" (`title`) in model "\uD83C\uDFE0 Home" (`home_page`)',
  );
  newFields['13623276'] = await client.fields.create(newItemTypes['2216253'], {
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    localized: true,
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: true, placeholder: null },
      type: 'title',
    },
    default_value: { en: '' },
  });

  console.log(
    'Create SEO meta tags field "SEO" (`seo`) in model "\uD83C\uDFE0 Home" (`home_page`)',
  );
  newFields['13623277'] = await client.fields.create(newItemTypes['2216253'], {
    label: 'SEO',
    field_type: 'seo',
    api_key: 'seo',
    localized: true,
    validators: { title_length: { max: 60 }, description_length: { max: 160 } },
    appearance: {
      addons: [],
      editor: 'seo',
      parameters: {
        fields: ['title', 'description', 'image', 'twitter_card'],
        previews: ['google', 'twitter', 'facebook'],
      },
    },
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Body" (`body_blocks`) in model "\uD83C\uDFE0 Home" (`home_page`)',
  );
  await client.fields.create(newItemTypes['2216253'], {
    id: 'pUj2PObgTyC-8X4lvZLMBA',
    label: 'Body',
    field_type: 'rich_text',
    api_key: 'body_blocks',
    localized: true,
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
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: true },
    },
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in model "\uD83D\uDCD1 Page" (`page`)',
  );
  newFields['13623255'] = await client.fields.create(newItemTypes['2596445'], {
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    localized: true,
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: true, placeholder: null },
      type: 'title',
    },
    default_value: { en: '' },
  });

  console.log(
    'Create Single link field "Parent page" (`parent_page`) in model "\uD83D\uDCD1 Page" (`page`)',
  );
  await client.fields.create(newItemTypes['2596445'], {
    id: 'FybgJf3dQ3G061OgVj1FHw',
    label: 'Parent page',
    field_type: 'link',
    api_key: 'parent_page',
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: [newItemTypes['2596445'].id],
      },
    },
    appearance: { addons: [], editor: 'link_select', parameters: {} },
    default_value: null,
  });

  console.log(
    'Create SEO meta tags field "SEO" (`seo`) in model "\uD83D\uDCD1 Page" (`page`)',
  );
  newFields['13623274'] = await client.fields.create(newItemTypes['2596445'], {
    label: 'SEO',
    field_type: 'seo',
    api_key: 'seo',
    localized: true,
    validators: { title_length: { max: 60 }, description_length: { max: 160 } },
    appearance: {
      addons: [],
      editor: 'seo',
      parameters: {
        fields: ['title', 'description', 'image', 'twitter_card'],
        previews: ['google', 'twitter', 'facebook'],
      },
    },
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Body" (`body_blocks`) in model "\uD83D\uDCD1 Page" (`page`)',
  );
  await client.fields.create(newItemTypes['2596445'], {
    id: 'Q-z1nyMsQtC8Sr6w6J2oGw',
    label: 'Body',
    field_type: 'rich_text',
    api_key: 'body_blocks',
    localized: true,
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
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: true },
    },
  });

  console.log(
    'Create Slug field "Slug" (`slug`) in model "\uD83D\uDCD1 Page" (`page`)',
  );
  newFields['13623256'] = await client.fields.create(newItemTypes['2596445'], {
    label: 'Slug',
    field_type: 'slug',
    api_key: 'slug',
    localized: true,
    validators: {
      slug_title_field: { title_field_id: newFields['13623255'].id },
      slug_format: { predefined_pattern: 'webpage_slug' },
      required: {},
      unique: {},
    },
    appearance: {
      addons: [],
      editor: 'slug',
      parameters: { url_prefix: null, placeholder: null },
    },
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in model "\uD83E\uDD37 Not found" (`not_found_page`)',
  );
  newFields['14562162'] = await client.fields.create(newItemTypes['2776649'], {
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    localized: true,
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: { en: '' },
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Body" (`body_blocks`) in model "\uD83E\uDD37 Not found" (`not_found_page`)',
  );
  await client.fields.create(newItemTypes['2776649'], {
    id: 'Zu006Xq0TMCAvV-vyQ_Iiw',
    label: 'Body',
    field_type: 'rich_text',
    api_key: 'body_blocks',
    localized: true,
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
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: true },
    },
  });

  console.log(
    'Create Structured text field "Text" (`text`) in block model "Text Image Block" (`text_image_block`)',
  );
  await client.fields.create('BRbU6VwTRgmG5SbwUs0rBg', {
    id: 'V4dMfrWsQ027JYEp6q3KhA',
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
  });

  console.log(
    'Create Single asset field "Image" (`image`) in block model "Text Image Block" (`text_image_block`)',
  );
  await client.fields.create('BRbU6VwTRgmG5SbwUs0rBg', {
    id: 'FubZXQtGR2ir_2G6-1fJtQ',
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
  });

  console.log(
    'Create Single-line string field "Layout" (`layout`) in block model "Text Image Block" (`text_image_block`)',
  );
  await client.fields.create('BRbU6VwTRgmG5SbwUs0rBg', {
    id: 'Ejw-eeKDTPWU-2EUtowmYg',
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
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in model "Page Partial" (`page_partial`)',
  );
  await client.fields.create('DAdmJVaoTZKumF9GYBZDfQ', {
    id: 'UFrvDLVxQju6Z35XHzuENQ',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    localized: true,
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: true, placeholder: null },
      type: 'title',
    },
    default_value: { en: '' },
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Body" (`blocks`) in model "Page Partial" (`page_partial`)',
  );
  await client.fields.create('DAdmJVaoTZKumF9GYBZDfQ', {
    id: 'SKLmdv71Rge0rKhJzOFQWQ',
    label: 'Body',
    field_type: 'rich_text',
    api_key: 'blocks',
    localized: true,
    validators: {
      rich_text_blocks: {
        item_types: [
          'BRbU6VwTRgmG5SbwUs0rBg',
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
  });

  console.log(
    'Create Structured text field "Text" (`text`) in block model "\uD83D\uDCDD Text Block" (`text_block`)',
  );
  await client.fields.create('PAk40zGjQJCcDXXPgygUrA', {
    id: 'NtVXfZ6gTL2sKNffNeUf5Q',
    label: 'Text',
    field_type: 'structured_text',
    api_key: 'text',
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
  });

  console.log(
    'Create Single asset field "Video" (`video_asset`) in block model "\uD83C\uDFAC Video Block" (`video_block`)',
  );
  await client.fields.create('QYfZyBzIRWKxA1MinIR0aQ', {
    id: 'KdXhYelkQdaepb_wpK7yuw',
    label: 'Video',
    field_type: 'file',
    api_key: 'video_asset',
    validators: { required: {} },
    appearance: { addons: [], editor: 'file', parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "\uD83C\uDFAC Video Block" (`video_block`)',
  );
  await client.fields.create('QYfZyBzIRWKxA1MinIR0aQ', {
    id: 'CYYGKtnXSkiSCTYMrOI3Yg',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    hint:
      'Optional title. By default the title from the selected video is used.',
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log(
    'Create Boolean field "Autoplay" (`autoplay`) in block model "\uD83C\uDFAC Video Block" (`video_block`)',
  );
  await client.fields.create('QYfZyBzIRWKxA1MinIR0aQ', {
    id: 'SEULcq3NS06_pDVrsHxiUA',
    label: 'Autoplay',
    field_type: 'boolean',
    api_key: 'autoplay',
    hint:
      'Note: video will only autoplay if device supports it and user has consented to 3rd party content.',
    appearance: { addons: [], editor: 'boolean', parameters: {} },
    default_value: false,
  });

  console.log(
    'Create Boolean field "Mute" (`mute`) in block model "\uD83C\uDFAC Video Block" (`video_block`)',
  );
  await client.fields.create('QYfZyBzIRWKxA1MinIR0aQ', {
    id: 'YaS-9DSqS3umFlirmXcOkw',
    label: 'Mute',
    field_type: 'boolean',
    api_key: 'mute',
    appearance: { addons: [], editor: 'boolean', parameters: {} },
    default_value: false,
  });

  console.log(
    'Create Boolean field "Loop" (`loop`) in block model "\uD83C\uDFAC Video Block" (`video_block`)',
  );
  await client.fields.create('QYfZyBzIRWKxA1MinIR0aQ', {
    id: 'AsETx2yITvOK2QKbu8bYRw',
    label: 'Loop',
    field_type: 'boolean',
    api_key: 'loop',
    appearance: { addons: [], editor: 'boolean', parameters: {} },
    default_value: false,
  });

  console.log(
    'Create Multiple links field "Tracks" (`tracks`) in block model "\uD83C\uDFAC Video Block" (`video_block`)',
  );
  await client.fields.create('QYfZyBzIRWKxA1MinIR0aQ', {
    id: 'WVz9yVpWSymoFxO4oKzzeA',
    label: 'Tracks',
    field_type: 'links',
    api_key: 'tracks',
    hint:
      'For accessibility, videos should provide both captions and transcripts that accurately describe its content. Captions allow people who are experiencing hearing loss to understand a video\'s audio content as the video is being played, while transcripts allow people who need additional time to be able to review audio content at a pace and format that is comfortable for them.',
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
    'Create Single-line string field "Title" (`title`) in model "\uD83D\uDD21 Video Text Track" (`video_text_track`)',
  );
  await client.fields.create('Us90isT5SgeXHuetcEj8eA', {
    id: 'GzfEVsO6QnOu2KRUaPhc5Q',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    hint:
      'A user-readable title of the text track which is used by the browser when listing available text tracks. Defaults to selected language name (English, Deutsch, etc) when empty.',
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log(
    'Create Single-line string field "Locale" (`locale`) in model "\uD83D\uDD21 Video Text Track" (`video_text_track`)',
  );
  await client.fields.create('Us90isT5SgeXHuetcEj8eA', {
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
    'Create Single-line string field "Kind" (`kind`) in model "\uD83D\uDD21 Video Text Track" (`video_text_track`)',
  );
  await client.fields.create('Us90isT5SgeXHuetcEj8eA', {
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
      parameters: { heading: false, placeholder: null },
    },
    default_value: 'subtitles',
  });

  console.log(
    'Create Single asset field "File" (`file`) in model "\uD83D\uDD21 Video Text Track" (`video_text_track`)',
  );
  await client.fields.create('Us90isT5SgeXHuetcEj8eA', {
    id: 'XNFlO-LWQJiMDd5r44PaKw',
    label: 'File',
    field_type: 'file',
    api_key: 'file',
    validators: { required: {}, extension: { extensions: ['vtt'] } },
    appearance: { addons: [], editor: 'file', parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "URL" (`url`) in block model "Embed Block" (`embed_block`)',
  );
  await client.fields.create('VZvVfu52RZK81WG0Dxp-FQ', {
    id: 'IX57s5MtS9OdHC7GdbEbgg',
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
    'Create JSON field "Data" (`data`) in block model "Embed Block" (`embed_block`)',
  );
  await client.fields.create('VZvVfu52RZK81WG0Dxp-FQ', {
    id: 'MGCF_FuyQaGzN9KvKzmgNA',
    label: 'Data',
    field_type: 'json',
    api_key: 'data',
    validators: { required: {} },
    appearance: {
      addons: [
        {
          id: plugins.find(
            (plugin) => plugin.package_name === 'datocms-plugin-oembed',
          )!.id,
          parameters: { urlFieldKey: 'url' },
          field_extension: 'oembedPlugin',
        },
      ],
      editor: 'json',
      parameters: {},
    },
    default_value: null,
  });

  console.log(
    'Create Multiple links field "Items" (`items`) in block model "Page Partial Block" (`page_partial_block`)',
  );
  await client.fields.create('V80liDVtRC-UYgd3Sm-dXg', {
    id: 'UgwMgWgIRPS-nqcdJdQYIg',
    label: 'Items',
    field_type: 'links',
    api_key: 'items',
    validators: {
      items_item_type: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: ['DAdmJVaoTZKumF9GYBZDfQ'],
      },
      size: { min: 1 },
    },
    appearance: { addons: [], editor: 'links_embed', parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Layout" (`layout`) in block model "Page Partial Block" (`page_partial_block`)',
  );
  await client.fields.create('V80liDVtRC-UYgd3Sm-dXg', {
    id: 'SO4JBlc8QCiQjRNJVlZPcw',
    label: 'Layout',
    field_type: 'string',
    api_key: 'layout',
    validators: {
      required: {},
      enum: {
        values: [
          'stack-untitled',
          'stack-titled',
          'accordion-closed',
          'accordion-open',
          'tabs',
        ],
      },
    },
    appearance: {
      addons: [],
      editor: 'string_radio_group',
      parameters: {
        radios: [
          {
            hint:
              'Show items, one after the other, without displaying their title.',
            label: 'Stack, untitled',
            value: 'stack-untitled',
          },
          {
            hint:
              'Show items, one after the other, with their title preceding their blocks content.',
            label: 'Stack, titled',
            value: 'stack-titled',
          },
          {
            hint:
              'Show items as accordion, with all items collapsed, showing only their titles.',
            label: 'Accordion, closed',
            value: 'accordion-closed',
          },
          {
            hint:
              'Show items as accordion, with the first item expanded, showing both its title and blocks content.',
            label: 'Accordion, open',
            value: 'accordion-open',
          },
          {
            hint:
              'Show items as tabbed interface, with their titles as tab labels and their blocks content in tab panels.',
            label: 'Tabs',
            value: 'tabs',
          },
        ],
      },
    },
    default_value: 'stack-untitled',
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in model "Internal link" (`internal_link`)',
  );
  await client.fields.create('WywlzYXpSVWFQIeeNk3iMw', {
    id: 'dSdakG3hSWSGNkm9YOCwGw',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    localized: true,
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: { en: '' },
  });

  console.log(
    'Create Single link field "Page" (`page`) in model "Internal link" (`internal_link`)',
  );
  await client.fields.create('WywlzYXpSVWFQIeeNk3iMw', {
    id: 'CdQJtWxySIak3Fs2cPJTEw',
    label: 'Page',
    field_type: 'link',
    api_key: 'page',
    localized: true,
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: 'fail',
        on_reference_unpublish_strategy: 'delete_references',
        on_reference_delete_strategy: 'delete_references',
        item_types: [newItemTypes['2216253'].id, newItemTypes['2596445'].id],
      },
      required: {},
    },
    appearance: { addons: [], editor: 'link_select', parameters: {} },
  });

  console.log(
    'Create Single asset field "Image" (`image`) in block model "\uD83D\uDDBC\uFE0F Image Block" (`image_block`)',
  );
  await client.fields.create('ZdBokLsWRgKKjHrKeJzdpw', {
    id: 'nl2r21M8SnKAgtrAmA9Ctw',
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
  });

  console.log(
    'Create External video field "Video" (`video`) in block model "\uD83C\uDFAC Video Embed Block" (`video_embed_block`)',
  );
  await client.fields.create('gezG9nO7SfaiWcWnp-HNqw', {
    id: 'e-ssNRziQK62ip37l6b-SQ',
    label: 'Video',
    field_type: 'video',
    api_key: 'video',
    validators: { required: {} },
    appearance: { addons: [], editor: 'video', parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "\uD83C\uDFAC Video Embed Block" (`video_embed_block`)',
  );
  await client.fields.create('gezG9nO7SfaiWcWnp-HNqw', {
    id: '-R9jKxclS8uo7QG2zH9Awg',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    hint:
      'Optional title. By default the title from the selected video is used.',
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log(
    'Create Boolean field "Autoplay" (`autoplay`) in block model "\uD83C\uDFAC Video Embed Block" (`video_embed_block`)',
  );
  await client.fields.create('gezG9nO7SfaiWcWnp-HNqw', {
    id: 's8Wb9qm6QI2EaSsjSNX1dA',
    label: 'Autoplay',
    field_type: 'boolean',
    api_key: 'autoplay',
    hint:
      'Note: video will only autoplay if device supports it and user has consented to 3rd party content.',
    appearance: { addons: [], editor: 'boolean', parameters: {} },
    default_value: false,
  });

  console.log(
    'Create Boolean field "Mute" (`mute`) in block model "\uD83C\uDFAC Video Embed Block" (`video_embed_block`)',
  );
  await client.fields.create('gezG9nO7SfaiWcWnp-HNqw', {
    id: '8VA1-iOTRzOlvQZHtUWhDQ',
    label: 'Mute',
    field_type: 'boolean',
    api_key: 'mute',
    appearance: { addons: [], editor: 'boolean', parameters: {} },
    default_value: false,
  });

  console.log(
    'Create Boolean field "Loop" (`loop`) in block model "\uD83C\uDFAC Video Embed Block" (`video_embed_block`)',
  );
  await client.fields.create('gezG9nO7SfaiWcWnp-HNqw', {
    id: 'UW6zA8RlQv-33Bifg67-YA',
    label: 'Loop',
    field_type: 'boolean',
    api_key: 'loop',
    appearance: { addons: [], editor: 'boolean', parameters: {} },
    default_value: false,
  });

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "Table Block" (`table_block`)',
  );
  await client.fields.create('0SxYNS2CR1it_5LHYWuEQg', {
    id: 'rCvzxtqpRJWdlSE8xH2plQ',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: '',
  });

  console.log(
    'Create JSON field "Table" (`table`) in block model "Table Block" (`table_block`)',
  );
  await client.fields.create('0SxYNS2CR1it_5LHYWuEQg', {
    id: 'ZpBMws8EQW2inOBtyVLgoA',
    label: 'Table',
    field_type: 'json',
    api_key: 'table',
    validators: { required: {} },
    default_value: null,
    appearance: {
      addons: [],
      editor: plugins.find(
        (plugin) => plugin.package_name === 'datocms-plugin-table-editor',
      )!.id,
      parameters: {},
      field_extension: 'table',
    },
  });

  console.log(
    'Create Boolean field "Has header row?" (`has_header_row`) in block model "Table Block" (`table_block`)',
  );
  await client.fields.create('0SxYNS2CR1it_5LHYWuEQg', {
    id: 'C4TKf4ifQ_S1QQK87nc9uw',
    label: 'Has header row?',
    field_type: 'boolean',
    api_key: 'has_header_row',
    hint:
      'The header row in the table above always needs unique values as these are used to identify the column values. Even if the table displayed on the page should not have a header row.',
    appearance: { addons: [], editor: 'boolean', parameters: {} },
    default_value: true,
  });

  console.log(
    'Create Boolean field "Has header column?" (`has_header_column`) in block model "Table Block" (`table_block`)',
  );
  await client.fields.create('0SxYNS2CR1it_5LHYWuEQg', {
    id: 'D2OLeqrZSBCbaxjC7ci1ng',
    label: 'Has header column?',
    field_type: 'boolean',
    api_key: 'has_header_column',
    hint:
      'If the switch is turned on, the first value in each row is used to describe the following values in that row.',
    appearance: { addons: [], editor: 'boolean', parameters: {} },
    default_value: false,
  });

  console.log('Finalize models/block models');

  console.log('Update model "\uD83C\uDFE0 Home" (`home_page`)');
  await client.itemTypes.update(newItemTypes['2216253'], {
    title_field: newFields['13623276'],
  });

  console.log('Update model "\uD83D\uDCD1 Page" (`page`)');
  await client.itemTypes.update(newItemTypes['2596445'], {
    title_field: newFields['13623255'],
  });

  console.log('Update model "\uD83E\uDD37 Not found" (`not_found_page`)');
  await client.itemTypes.update(newItemTypes['2776649'], {
    title_field: newFields['14562162'],
  });

  console.log('Update model "Page Partial" (`page_partial`)');
  await client.itemTypes.update('DAdmJVaoTZKumF9GYBZDfQ', {
    title_field: { id: 'UFrvDLVxQju6Z35XHzuENQ', type: 'field' },
  });

  console.log(
    'Update model "\uD83D\uDD21 Video Text Track" (`video_text_track`)',
  );
  await client.itemTypes.update('Us90isT5SgeXHuetcEj8eA', {
    title_field: { id: 'AD-nA46KQc2wL8978d6asg', type: 'field' },
    image_preview_field: { id: 'XNFlO-LWQJiMDd5r44PaKw', type: 'field' },
  });

  console.log('Update model "Internal link" (`internal_link`)');
  await client.itemTypes.update('WywlzYXpSVWFQIeeNk3iMw', {
    title_field: { id: 'dSdakG3hSWSGNkm9YOCwGw', type: 'field' },
  });

  console.log('Manage menu items');

  console.log('Create menu item "\uD83C\uDFE0 Home"');
  newMenuItems['1291667'] = await client.menuItems.create({
    label: '\uD83C\uDFE0 Home',
    item_type: newItemTypes['2216253'],
  });

  console.log('Create menu item "\uD83D\uDCD1 Pages"');
  newMenuItems['1569863'] = await client.menuItems.create({
    label: '\uD83D\uDCD1 Pages',
    item_type: newItemTypes['2596445'],
  });

  console.log('Create menu item "\uD83E\uDD37 404 Page"');
  newMenuItems['1690698'] = await client.menuItems.create({
    label: '\uD83E\uDD37 404 Page',
    item_type: newItemTypes['2776649'],
  });
}
