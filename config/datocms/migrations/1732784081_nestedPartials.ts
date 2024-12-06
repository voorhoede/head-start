import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Modular Content (Multiple blocks) field "Body" (`blocks`) in model "\uD83E\uDDE9 Page Partial" (`page_partial`)'
  );
  await client.fields.update('SKLmdv71Rge0rKhJzOFQWQ', {
    validators: {
      rich_text_blocks: {
        item_types: [
          'BRbU6VwTRgmG5SbwUs0rBg', // Text Image Block
          'PAk40zGjQJCcDXXPgygUrA', // Text Block
          'V80liDVtRC-UYgd3Sm-dXg', // Page Partial Block
          'ZdBokLsWRgKKjHrKeJzdpw', // Image Block
          'gezG9nO7SfaiWcWnp-HNqw', // Video Embed Block
          '0SxYNS2CR1it_5LHYWuEQg', // Table Block
        ],
      },
    },
  });

  console.log('Finalize models/block models');

  console.log('Update model "\uD83E\uDDE9 Page Partial" (`page_partial`)');
  await client.itemTypes.update('DAdmJVaoTZKumF9GYBZDfQ', {
    name: '\uD83E\uDDE9 Page Partial',
  });
}
