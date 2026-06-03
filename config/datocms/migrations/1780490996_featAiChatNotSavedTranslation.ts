import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  const translation = await client.itemTypes.find('translation');

  const translationContent: Record<string, { en: string; nl: string }> = {
    chat_not_saved: {
      en: 'This chat could not be saved. You can keep chatting, but refreshing the page will lose earlier messages.',
      nl: 'Dit gesprek kon niet worden opgeslagen. Je kunt blijven chatten, maar als je de pagina ververst gaan eerdere berichten verloren.',
    },
  };

  console.log('Create AI Chat "not saved" translation content');
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
