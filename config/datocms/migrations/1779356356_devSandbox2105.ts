import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Create new models/block models');

  console.log(
    'Create block model "\uD83D\uDD0D Search form block" (`search_form_block`)',
  );
  await client.itemTypes.create(
    {
      id: 'QzOde8F5Qy6r7HPIazVIeQ',
      name: '\uD83D\uDD0D Search form block',
      api_key: 'search_form_block',
      modular_block: true,
      draft_saving_active: false,
      hint: '',
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: 'LkFE7qE2QumOj8v2267xHA',
    },
  );

  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "\uD83D\uDD0D Search form block" (`search_form_block`)',
  );
  await client.fields.create('QzOde8F5Qy6r7HPIazVIeQ', {
    id: 'JdRxITLwT9GIuvLpQvSWFQ',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: null,
  });

  console.log(
    'Create Single-line string field "Query" (`query`) in block model "\uD83D\uDD0D Search form block" (`search_form_block`)',
  );
  await client.fields.create('QzOde8F5Qy6r7HPIazVIeQ', {
    id: 'SZLwkYXuTD21tWzzinv8Fg',
    label: 'Query',
    field_type: 'string',
    api_key: 'query',
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: null,
  });

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`blocks`) in model "\uD83E\uDDE9 Page Partial" (`page_partial`)',
  );
  await client.fields.update('SKLmdv71Rge0rKhJzOFQWQ', {
    validators: {
      rich_text_blocks: {
        item_types: [
          'BRbU6VwTRgmG5SbwUs0rBg',
          'F60ZY1wFSW2qbvh99poj3g',
          'PAk40zGjQJCcDXXPgygUrA',
          'QYfZyBzIRWKxA1MinIR0aQ',
          'QzOde8F5Qy6r7HPIazVIeQ',
          'TBuD6qQOSDy6i9dM3T_XEA',
          'Tv6MHewBS4evujN0EuSrwQ',
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
    },
  });

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`body_blocks`) in model "\uD83D\uDCD1 Page" (`page`)',
  );
  await client.fields.update('Q-z1nyMsQtC8Sr6w6J2oGw', {
    validators: {
      rich_text_blocks: {
        item_types: [
          'BRbU6VwTRgmG5SbwUs0rBg',
          'F60ZY1wFSW2qbvh99poj3g',
          'PAk40zGjQJCcDXXPgygUrA',
          'QYfZyBzIRWKxA1MinIR0aQ',
          'QzOde8F5Qy6r7HPIazVIeQ',
          'TBuD6qQOSDy6i9dM3T_XEA',
          'Tv6MHewBS4evujN0EuSrwQ',
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
    'Update Modular Content (Multiple blocks) field "Body" (`body_blocks`) in model "\uD83C\uDFE0 Home" (`home_page`)',
  );
  await client.fields.update('pUj2PObgTyC-8X4lvZLMBA', {
    validators: {
      rich_text_blocks: {
        item_types: [
          'BRbU6VwTRgmG5SbwUs0rBg',
          'F60ZY1wFSW2qbvh99poj3g',
          'PAk40zGjQJCcDXXPgygUrA',
          'QYfZyBzIRWKxA1MinIR0aQ',
          'QzOde8F5Qy6r7HPIazVIeQ',
          'TBuD6qQOSDy6i9dM3T_XEA',
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
    'Update Modular Content (Multiple blocks) field "Body" (`body_blocks`) in model "\uD83E\uDD37 Not found" (`not_found_page`)',
  );
  await client.fields.update('Zu006Xq0TMCAvV-vyQ_Iiw', {
    validators: {
      rich_text_blocks: {
        item_types: [
          'BRbU6VwTRgmG5SbwUs0rBg',
          'F60ZY1wFSW2qbvh99poj3g',
          'PAk40zGjQJCcDXXPgygUrA',
          'QYfZyBzIRWKxA1MinIR0aQ',
          'QzOde8F5Qy6r7HPIazVIeQ',
          'VZvVfu52RZK81WG0Dxp-FQ',
          'V80liDVtRC-UYgd3Sm-dXg',
          'ZdBokLsWRgKKjHrKeJzdpw',
          'gezG9nO7SfaiWcWnp-HNqw',
          '0SxYNS2CR1it_5LHYWuEQg',
        ],
      },
    },
  });

  console.log('Finalize models/block models');

  console.log(
    'Update block model "\uD83D\uDD0D Search form block" (`search_form_block`)',
  );
  await client.itemTypes.update('QzOde8F5Qy6r7HPIazVIeQ', {
    presentation_title_field: { id: 'JdRxITLwT9GIuvLpQvSWFQ', type: 'field' },
  });
}
