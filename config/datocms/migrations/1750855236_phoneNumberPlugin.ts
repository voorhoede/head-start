import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Manage upload filters');

  console.log('Install plugin "Phone Number"');
  await client.plugins.create({
    id: 'CAQilGMyRlGtygeH_obytw',
    package_name: 'datocms-plugin-phone-number',
  });

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Single-line string field "Phone number" (`phone_number`) in block model "\uD83D\uDCDE Phone Link" (`phone_link`)',
  );
  await client.fields.update('bfnOOp5cSM-x8S5RKEpKsw', {
    appearance: {
      addons: [],
      editor: 'CAQilGMyRlGtygeH_obytw',
      parameters: { excludeCountries: [], includeCountries: [] },
      field_extension: 'phoneNumber',
    },
  });
}
