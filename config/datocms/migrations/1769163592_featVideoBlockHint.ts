import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Single asset field "Video" (`video_asset`) in block model "\uD83C\uDFAC Video Block" (`video_block`)',
  );
  await client.fields.update('KdXhYelkQdaepb_wpK7yuw', {
    hint: '\u26A0\uFE0F Note! Video streaming time is part of the variable costs of your Dato CMS plan.',
  });
}
