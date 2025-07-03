import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Manage upload filters');

  console.log('Install plugin "Phone Number"');
  const plugin = await client.plugins.create({
    package_name: 'datocms-plugin-phone-number',
  });

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Single-line string field "Phone number" (`phone_number`) in block model "\uD83D\uDCDE Phone Link" (`phone_link`)',
  );
  const field = await client.fields.find('phone_link::phone_number');
  await client.fields.update(field.id, {
    appearance: {
      ...field.appearance,
      editor: plugin.id,
      field_extension: 'phoneNumber',
    },
  });
}
