import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  const translation = await client.itemTypes.find('translation');

  const translationContent: Record<string, { en: string; nl: string }> = {
    ask: {
      en: 'Ask AI',
      nl: 'Vraag AI',
    },
    ask_on_site: {
      en: 'Ask {{ siteName }}',
      nl: 'Vraag {{ siteName }}',
    },
    ask_intro: {
      en: 'Ask a question and get an answer drawn from this site\'s content.',
      nl: 'Stel een vraag en krijg een antwoord op basis van de content op deze site.',
    },
    ask_label: {
      en: 'Ask a question',
      nl: 'Stel een vraag',
    },
    ask_placeholder: {
      en: 'Ask a question about this site…',
      nl: 'Stel een vraag over deze site…',
    },
    ask_submit: {
      en: 'Ask',
      nl: 'Vraag',
    },
    ask_answer: {
      en: 'Answer',
      nl: 'Antwoord',
    },
    ask_sources: {
      en: 'Sources',
      nl: 'Bronnen',
    },
    ask_thinking: {
      en: 'Thinking…',
      nl: 'Bezig met nadenken…',
    },
    ask_empty: {
      en: 'No answer found for that question.',
      nl: 'Geen antwoord gevonden op die vraag.',
    },
    ask_error: {
      en: 'Something went wrong. Please try again.',
      nl: 'Er ging iets mis. Probeer het opnieuw.',
    },
  };

  console.log('Create Ask AI translation content');
  await Promise.all(
    Object.entries(translationContent).map(([key, value]) =>
      client.items.create({
        item_type: { type: 'item_type', id: translation.id },
        key,
        value,
      }),
    ),
  );
}
