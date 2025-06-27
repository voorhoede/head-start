import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Structured text field "Text" (`text`) in block model "#\uFE0F\u20E3 Heading Block" (`heading_block`)',
  );
  await client.fields.update('N3DsL75WSTqZINhfJip76A', {
    hint: 'The text should describe the content that follows. Use paragraph or heading styles to control the visual appearance.',
  });

  console.log(
    'Update Integer number field "Level" (`level`) in block model "#\uFE0F\u20E3 Heading Block" (`heading_block`)',
  );
  await client.fields.update('II0R4VTcSoi-szQ0s-zkBQ', {
    hint: 'Choose the heading level (2-6) based on your page structure. Level 2 for main sections, level 3 for subsections within those, level 4 for sub-subsections, etc. Always follow sequential order - don\'t jump from level 2 directly to level 4.',
  });

  console.log('Finalize models/block models');

  console.log(
    'Update block model "#\uFE0F\u20E3 Heading Block" (`heading_block`)',
  );
  await client.itemTypes.update('BQFNgVsiRMO2N618F-cyxA', {
    hint: 'Create semantically correct headings with rich text styling.',
  });
}
