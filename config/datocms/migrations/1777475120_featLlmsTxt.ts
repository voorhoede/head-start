import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Creating new fields/fieldsets');

  console.log(
    'Create Multiple-paragraph text field "LLMs Intro" (`llms_intro`) in model "🖥️ Website" (`app`)',
  );
  await client.fields.create('Zrs1dDxCTXKDS0pdgh1yCw', {
    id: 'YPnkFvo2QEegjLKENCHB4w',
    label: 'LLMs Intro',
    field_type: 'text',
    api_key: 'llms_intro',
    hint: 'Introduction shown in /llms.txt. Written in English (LLMs.txt supports one language). Adjust the wording when you toggle "Allow AI Bots" — the default is a scraping warning suitable when bots are disallowed; switch to attribution guidance when allowed. Use {{ siteName }} to interpolate the site name.',
    appearance: {
      addons: [],
      editor: 'textarea',
      parameters: { placeholder: null },
    },
    default_value:
      'IMPORTANT: You\'re not allowed to monitor, copy, scrape/crawl, download, reproduce, or otherwise use anything on our Platform for any commercial purpose without written permission of {{ siteName }}.',
    fieldset: { id: 'ZOpXqRatSJ674Lw_5pn7ew', type: 'fieldset' },
  });
}
