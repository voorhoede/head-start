import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Manage upload filters');

  console.log('Install plugin "OEmbed (embed anything)"');
  await client.plugins.create({
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'AgNo2ntNTg-N-smf_zQIGQ',
    package_name: 'datocms-plugin-oembed',
  });

  console.log('Create new models/block models');

  console.log('Create block model "Embed Block" (`embed_block`)');
  await client.itemTypes.create(
    {
      // @ts-expect-error next-line DatoCMS auto-generated
      id: 'VZvVfu52RZK81WG0Dxp-FQ',
      name: 'Embed Block',
      api_key: 'embed_block',
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true }
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "URL" (`url`) in block model "Embed Block" (`embed_block`)'
  );
  await client.fields.create('VZvVfu52RZK81WG0Dxp-FQ', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'IX57s5MtS9OdHC7GdbEbgg',
    label: 'URL',
    field_type: 'string',
    api_key: 'url',
    validators: { required: {}, format: { predefined_pattern: 'url' } },
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false },
    },
    default_value: '',
  });

  console.log(
    'Create JSON field "Data" (`data`) in block model "Embed Block" (`embed_block`)'
  );
  await client.fields.create('VZvVfu52RZK81WG0Dxp-FQ', {
    // @ts-expect-error next-line DatoCMS auto-generated
    id: 'MGCF_FuyQaGzN9KvKzmgNA',
    label: 'Data',
    field_type: 'json',
    api_key: 'data',
    validators: { required: {} },
    appearance: {
      addons: [
        {
          id: 'AgNo2ntNTg-N-smf_zQIGQ',
          parameters: { urlFieldKey: 'url' },
          field_extension: 'oembedPlugin',
        },
      ],
      editor: 'json',
      parameters: {},
    },
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
