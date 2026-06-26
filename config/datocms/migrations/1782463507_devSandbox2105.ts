import { Client } from '@datocms/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Create new models/block models');

  console.log(
    'Create Single-line string field "AI Content Policy" (`ai_content_policy`) in model "\uD83D\uDDA5\uFE0F Website" (`app`)',
  );
  await client.fields.create('Zrs1dDxCTXKDS0pdgh1yCw', {
    id: 'Bf6nbFGBSW6KDEtosCegcg',
    label: 'AI Content Policy',
    field_type: 'string',
    api_key: 'ai_content_policy',
    hint: 'Decides how AI can use your website (doesn\'t take effect when indexing is off). AI training and AI input only take effect when \'Allow AI bots\' is enabled. Search applies regardless.',
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: 'string_select',
      parameters: {
        options: [
          {
            hint: 'Most restrictive. Tells AI companies and search engines not to use your content for any purpose without your written permission. May cause search engines like Google to leave your site out of search results.',
            label: 'Disallow All',
            value: 'disallow-all',
          },
          {
            hint: 'Lets your pages appear in normal search results (hyperlinks and short excerpts). Does not include AI-generated summaries, AI Input, or AI Training.',
            label: 'Allow Search Only',
            value: 'search-only',
          },
          {
            hint: 'The above, plus AI Input: letting an AI read your live pages to answer someone\'s question (e.g. AI search answers, chatbots that quote your site). Does not allow training AI models on your content.',
            label: 'Allow Search & AI Input',
            value: 'search-ai-input',
          },
          {
            hint: 'Allows all uses, including training AI models on your content.',
            label: 'Allow Search, AI Input & AI Training',
            value: 'search-ai-input-ai-training',
          },
        ],
      },
    },
    default_value: 'search-only',
    fieldset: { id: 'ZOpXqRatSJ674Lw_5pn7ew', type: 'fieldset' },
  });

  console.log(
    'Update Single-line string field "AI Content Policy" (`ai_content_policy`) in model "\uD83D\uDDA5\uFE0F Website" (`app`)',
  );
  await client.fields.update('Bf6nbFGBSW6KDEtosCegcg', { position: 1 });
}
