import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  const translation = await client.itemTypes.find('translation');

  const translationContent: Record<string, { en: string; nl: string }> = {
    chat: {
      en: 'Chat',
      nl: 'Chat',
    },
    chat_on_site: {
      en: 'Chat with {{ siteName }}',
      nl: 'Chat met {{ siteName }}',
    },
    chat_intro: {
      en: 'Ask follow-up questions and get answers drawn from this site\'s content.',
      nl: 'Stel vervolgvragen en krijg antwoorden op basis van de content op deze site.',
    },
    chat_label: {
      en: 'Ask a question',
      nl: 'Stel een vraag',
    },
    chat_placeholder: {
      en: 'Ask a question…',
      nl: 'Stel een vraag…',
    },
    chat_submit: {
      en: 'Send',
      nl: 'Versturen',
    },
    chat_clear: {
      en: 'Clear chat',
      nl: 'Wis gesprek',
    },
    chat_thinking: {
      en: 'Thinking…',
      nl: 'Bezig met nadenken…',
    },
    chat_empty: {
      en: 'No answer found for that question.',
      nl: 'Geen antwoord gevonden op die vraag.',
    },
    chat_error: {
      en: 'Something went wrong. Please try again.',
      nl: 'Er ging iets mis. Probeer het opnieuw.',
    },
    chat_empty_state: {
      en: 'Ask a question to start a conversation.',
      nl: 'Stel een vraag om een gesprek te starten.',
    },
  };

  console.log('Create AI Chat translation content');
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
