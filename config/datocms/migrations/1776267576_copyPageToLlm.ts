import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Creating new fields/fieldsets');

  console.log(
    'Create fieldset "AI section" in model "\uD83D\uDDA5\uFE0F Website" (`app`)',
  );
  await client.fieldsets.create('Zrs1dDxCTXKDS0pdgh1yCw', {
    id: 'ZOpXqRatSJ674Lw_5pn7ew',
    title: 'AI section',
    hint: 'If allow AI bots is on, it will show a button on the page which allows the user to copy the page as a markdown file or open a link with a question to a certain LLM',
  });

  console.log(
    'Create Single-line string field "Open page in LLM prompt " (`open_page_in_llm_prompt`) in model "\uD83D\uDDA5\uFE0F Website" (`app`)',
  );
  await client.fields.create('Zrs1dDxCTXKDS0pdgh1yCw', {
    id: 'ZhpjpR23QgCNSnrdW0fzfw',
    label: 'Open page in LLM prompt ',
    field_type: 'string',
    api_key: 'open_page_in_llm_prompt',
    hint: 'If you type { pageUrl } in this text, it will be changed with the current page url. ',
    localized: true,
    appearance: {
      addons: [],
      editor: 'single_line',
      parameters: { heading: false, placeholder: null },
    },
    default_value: {
      en: 'Read from this URL: { pageUrl } and explain it to me.',
      nl: null,
    },
    fieldset: { id: 'ZOpXqRatSJ674Lw_5pn7ew', type: 'fieldset' },
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Open page in LLM option" (`open_page_in_llm_option`) in model "\uD83D\uDDA5\uFE0F Website" (`app`)',
  );
  await client.fields.create('Zrs1dDxCTXKDS0pdgh1yCw', {
    id: 'N4BTo0L9TXKJ41wlBL4QXA',
    label: 'Open page in LLM option',
    field_type: 'rich_text',
    api_key: 'open_page_in_llm_option',
    hint: 'Choose the LLM\'s the user can open this page contents in',
    localized: true,
    validators: {
      rich_text_blocks: { item_types: ['Yk1ge9eTTf25Iwph1Dx3_g'] },
    },
    appearance: {
      addons: [],
      editor: 'rich_text',
      parameters: { start_collapsed: true },
    },
    fieldset: { id: 'ZOpXqRatSJ674Lw_5pn7ew', type: 'fieldset' },
  });

  console.log('Update existing fields/fieldsets');

  console.log(
    'Update Boolean field "Allow AI Bots" (`allow_ai_bots`) in model "\uD83D\uDDA5\uFE0F Website" (`app`)',
  );
  await client.fields.update('LMT_L4wOT2yMX7S3ZViZAw', {
    position: 0,
    fieldset: { id: 'ZOpXqRatSJ674Lw_5pn7ew', type: 'fieldset' },
  });

  console.log(
    'Update Single-line string field "Open page in LLM prompt " (`open_page_in_llm_prompt`) in model "\uD83D\uDDA5\uFE0F Website" (`app`)',
  );
  await client.fields.update('ZhpjpR23QgCNSnrdW0fzfw', { position: 1 });

  console.log(
    'Update Modular Content (Multiple blocks) field "Open page in LLM option" (`open_page_in_llm_option`) in model "\uD83D\uDDA5\uFE0F Website" (`app`)',
  );
  await client.fields.update('N4BTo0L9TXKJ41wlBL4QXA', { position: 2 });

  console.log('Finalize models/block models');

  console.log('Update model "\uD83D\uDDA5\uFE0F Website" (`app`)');
  await client.itemTypes.update('Zrs1dDxCTXKDS0pdgh1yCw', {
    presentation_title_field: { id: 'ZhpjpR23QgCNSnrdW0fzfw', type: 'field' },
    title_field: { id: 'ZhpjpR23QgCNSnrdW0fzfw', type: 'field' },
  });
}
