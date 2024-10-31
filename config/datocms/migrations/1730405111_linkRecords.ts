import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Structured text field "Text" (`text`) in block model "\uD83D\uDCDD \uD83D\uDDBC\uFE0F Text Image Block" (`text_image_block`)'
  );
  await client.fields.update('V4dMfrWsQ027JYEp6q3KhA', {
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
        item_types: ['LjXdkuCdQxCFT4hv8_ayew', 'X_tZn3TxQY28ltSyjZUGHQ'],
      },
    },
  });

  console.log(
    'Update Slug field "Slug" (`slug`) in model "\uD83D\uDCD1 Page" (`page`)'
  );
  await client.fields.update('SFfpl7xiQaGe5-jy6tlPfg', { position: 2 });

  console.log(
    'Update Structured text field "Text" (`text`) in block model "\uD83D\uDCDD Text Block" (`text_block`)'
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
        item_types: ['LjXdkuCdQxCFT4hv8_ayew', 'X_tZn3TxQY28ltSyjZUGHQ'],
      },
    },
  });

  console.log('Destroy models/block models');

  console.log('Delete model "Internal link" (`internal_link`)');
  await client.itemTypes.destroy('WywlzYXpSVWFQIeeNk3iMw', {
    skip_menu_items_deletion: true,
  });

  console.log('Finalize models/block models');

  console.log(
    'Update block model "\uD83D\uDCDD \uD83D\uDDBC\uFE0F Text Image Block" (`text_image_block`)'
  );
  await client.itemTypes.update('BRbU6VwTRgmG5SbwUs0rBg', {
    name: '\uD83D\uDCDD \uD83D\uDDBC\uFE0F Text Image Block',
  });

  console.log('Update model "\uD83D\uDCCE Page Partial" (`page_partial`)');
  await client.itemTypes.update('DAdmJVaoTZKumF9GYBZDfQ', {
    name: '\uD83D\uDCCE Page Partial',
  });

  console.log(
    'Update model "\u2934\uFE0F Schema migration" (`schema_migration`)'
  );
  await client.itemTypes.update('EkWwcYfPQSGXskAZKO_tTg', {
    name: '\u2934\uFE0F Schema migration',
  });

  console.log('Update block model "\uD83D\uDCCE Embed Block" (`embed_block`)');
  await client.itemTypes.update('VZvVfu52RZK81WG0Dxp-FQ', {
    name: '\uD83D\uDCCE Embed Block',
  });

  console.log(
    'Update block model "\uD83E\uDDE9 Page Partial Block" (`page_partial_block`)'
  );
  await client.itemTypes.update('V80liDVtRC-UYgd3Sm-dXg', {
    name: '\uD83E\uDDE9 Page Partial Block',
  });

  console.log('Update block model "\uD83D\uDCCA Table Block" (`table_block`)');
  await client.itemTypes.update('0SxYNS2CR1it_5LHYWuEQg', {
    name: '\uD83D\uDCCA Table Block',
  });

  console.log('Manage menu items');

  console.log('Delete menu item "Schema migration"');
  await client.menuItems.destroy('Pl3NAPTcQVmC0ben2g6V8Q');

  console.log('Update menu item "\uD83C\uDF10 Translations"');
  await client.menuItems.update('Rl4MJgiIR2akoRpTSmqHHg', {
    label: '\uD83C\uDF10 Translations',
    position: 5,
  });

  console.log('Update menu item "\uD83D\uDCD1 Pages"');
  await client.menuItems.update('B_78LT8CQ12Cyj27FKLw-Q', { position: 3 });

  console.log('Update menu item "\uD83C\uDFE0 Home"');
  await client.menuItems.update('C2TTNIPgSZapZlrQpxEdSQ', { position: 2 });

  console.log('Update menu item "\uD83E\uDD37 404 Page"');
  await client.menuItems.update('LNNzMSjXQ5CDv1JmXT0XOg', { position: 4 });

  console.log('Manage schema menu items');

  console.log(
    'Update model schema menu item for model "\u21AA\uFE0F Redirect Rule" (`redirect_rule`)'
  );
  await client.schemaMenuItems.update('BRzL0jdbQQqacDw3HUCsQg', {
    position: 17,
  });

  console.log(
    'Update block schema menu item for block model "\uD83D\uDDBC\uFE0F Image Block" (`image_block`)'
  );
  await client.schemaMenuItems.update('fB8nvvdwQVSuncWPedJ4JQ', {
    position: 14,
  });

  console.log(
    'Update block schema menu item for block model "\uD83D\uDCCA Table Block" (`table_block`)'
  );
  await client.schemaMenuItems.update('DQCIP-i7SzCbmCKHeZOVmQ', {
    position: 16,
  });

  console.log(
    'Update block schema menu item for block model "\uD83C\uDFAC Video Embed Block" (`video_embed_block`)'
  );
  await client.schemaMenuItems.update('ZidgZpjxQJOa0Yvl2DFzdg', {
    position: 15,
  });
}
