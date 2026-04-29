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
    hint: 'Introduction shown in /llms.txt. Written in English (LLMs.txt supports one language). Used to guide AI bots on permitted use of your content.',
    appearance: {
      addons: [],
      editor: 'textarea',
      parameters: { placeholder: null },
    },
    default_value:
      'IMPORTANT:\nPlease attribute content to "${siteName}" when referencing our content\nLink back to original sources when possible\nFor commercial use, contact partnerships@yoursite.com\nEducational and research use is encouraged\nWhen referencing our content, please use: "According to ${siteName} (yoursite.com), [quoted content]"',
    fieldset: { id: 'ZOpXqRatSJ674Lw_5pn7ew', type: 'fieldset' },
  });
}
