import type { Client, SimpleSchemaTypes } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newItemTypes: Record<string, SimpleSchemaTypes.ItemType> = {};

  console.log('Create new models/block models');

  console.log('Create block model "Video Embed Block" (`video_embed_block`)');
  newItemTypes['gezG9nO7SfaiWcWnp-HNqw'] = await client.itemTypes.create(
    {
      name: 'Video Embed Block',
      api_key: 'video_embed_block',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true }
  );

  console.log('Create block model "Image Block" (`image_block`)');
  newItemTypes['ZdBokLsWRgKKjHrKeJzdpw'] = await client.itemTypes.create(
    {
      name: 'Image Block',
      api_key: 'image_block',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true }
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create External video field "Video" (`video`) in block model "Video Embed Block" (`video_embed_block`)'
  );
  newFields['e-ssNRziQK62ip37l6b-SQ'] = await client.fields.create(
    newItemTypes['gezG9nO7SfaiWcWnp-HNqw'],
    {
      label: 'Video',
      field_type: 'video',
      api_key: 'video',
      validators: { required: {} },
      appearance: { addons: [], editor: 'video', parameters: {} },
      default_value: null,
    }
  );

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "Video Embed Block" (`video_embed_block`)'
  );
  newFields['-R9jKxclS8uo7QG2zH9Awg'] = await client.fields.create(
    newItemTypes['gezG9nO7SfaiWcWnp-HNqw'],
    {
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
    }
  );

  console.log(
    'Create Boolean field "Autoplay" (`autoplay`) in block model "Video Embed Block" (`video_embed_block`)'
  );
  newFields['s8Wb9qm6QI2EaSsjSNX1dA'] = await client.fields.create(
    newItemTypes['gezG9nO7SfaiWcWnp-HNqw'],
    {
      label: 'Autoplay',
      field_type: 'boolean',
      api_key: 'autoplay',
      hint: 'Note: video will only autoplay if device supports it and user has consented to 3rd party content.',
      appearance: { addons: [], editor: 'boolean', parameters: {} },
      default_value: null,
    }
  );

  console.log(
    'Create Boolean field "Mute" (`mute`) in block model "Video Embed Block" (`video_embed_block`)'
  );
  newFields['8VA1-iOTRzOlvQZHtUWhDQ'] = await client.fields.create(
    newItemTypes['gezG9nO7SfaiWcWnp-HNqw'],
    {
      label: 'Mute',
      field_type: 'boolean',
      api_key: 'mute',
      appearance: { addons: [], editor: 'boolean', parameters: {} },
      default_value: null,
    }
  );

  console.log(
    'Create Boolean field "Loop" (`loop`) in block model "Video Embed Block" (`video_embed_block`)'
  );
  newFields['UW6zA8RlQv-33Bifg67-YA'] = await client.fields.create(
    newItemTypes['gezG9nO7SfaiWcWnp-HNqw'],
    {
      label: 'Loop',
      field_type: 'boolean',
      api_key: 'loop',
      appearance: { addons: [], editor: 'boolean', parameters: {} },
      default_value: null,
    }
  );

  console.log(
    'Create Single asset field "Image" (`image`) in block model "Image Block" (`image_block`)'
  );
  newFields['nl2r21M8SnKAgtrAmA9Ctw'] = await client.fields.create(
    newItemTypes['ZdBokLsWRgKKjHrKeJzdpw'],
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

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Modular content field "Body" (`body_blocks`) in model "Home" (`home`)'
  );
  await client.fields.update('pUj2PObgTyC-8X4lvZLMBA', {
    validators: {
      rich_text_blocks: {
        item_types: [
          'PAk40zGjQJCcDXXPgygUrA',
          newItemTypes['ZdBokLsWRgKKjHrKeJzdpw'].id,
          newItemTypes['gezG9nO7SfaiWcWnp-HNqw'].id,
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
          'PAk40zGjQJCcDXXPgygUrA',
          newItemTypes['ZdBokLsWRgKKjHrKeJzdpw'].id,
          newItemTypes['gezG9nO7SfaiWcWnp-HNqw'].id,
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
    },
  });
}
