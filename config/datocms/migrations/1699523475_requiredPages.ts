import type { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Finalize models/block models');

  console.log('Update model "Home" (`home`)');
  await client.itemTypes.update('2216253', {
    draft_mode_active: true,
    all_locales_required: true,
  });

  console.log('Update model "Page" (`page`)');
  await client.itemTypes.update('2596445', { all_locales_required: false });
}
