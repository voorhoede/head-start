import type { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Modular content field "Body" (`body_blocks`) in model "\uD83E\uDD37 Not found" (`not_found_page`)'
  );
  await client.fields.create('2776649', {
    // @ts-expect-error next-line DatoCMS auto-generated
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

  console.log('Finalize models/block models');

  console.log('Update model "\uD83C\uDFE0 Home" (`home_page`)');
  await client.itemTypes.update('2216253', {
    name: '\uD83C\uDFE0 Home',
    api_key: 'home_page',
  });

  console.log('Update model "\uD83C\uDF10 Translation" (`translation`)');
  await client.itemTypes.update('2229390', {
    name: '\uD83C\uDF10 Translation',
  });

  console.log('Update model "\uD83D\uDCD1 Page" (`page`)');
  await client.itemTypes.update('2596445', { name: '\uD83D\uDCD1 Page' });

  console.log('Update model "\uD83E\uDD37 Not found" (`not_found_page`)');
  await client.itemTypes.update('2776649', {
    name: '\uD83E\uDD37 Not found',
    api_key: 'not_found_page',
  });

  console.log(
    'Update block model "\uD83D\uDDBC\uFE0F Image Block" (`image_block`)'
  );
  await client.itemTypes.update('ZdBokLsWRgKKjHrKeJzdpw', {
    name: '\uD83D\uDDBC\uFE0F Image Block',
  });

  console.log('Update block model "\uD83D\uDCDD Text Block" (`text_block`)');
  await client.itemTypes.update('PAk40zGjQJCcDXXPgygUrA', {
    name: '\uD83D\uDCDD Text Block',
  });

  console.log(
    'Update block model "\uD83C\uDFAC Video Embed Block" (`video_embed_block`)'
  );
  await client.itemTypes.update('gezG9nO7SfaiWcWnp-HNqw', {
    name: '\uD83C\uDFAC Video Embed Block',
  });

  console.log('Manage menu items');

  console.log('Update menu item "\uD83E\uDD37 404 Page"');
  await client.menuItems.update('1690698', { label: '\uD83E\uDD37 404 Page' });
}
