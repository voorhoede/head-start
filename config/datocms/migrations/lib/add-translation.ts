import type { Client } from '@datocms/cli/lib/cma-client-node';

export async function addTranslation(
  { client, key, value }: 
  { client: Client, key: string, value: { [key: string]: string } }
) {
  const { locales } = await client.site.find();
  locales.forEach((locale) => {
    if (!value[locale]) {
      throw new Error(`Missing translation value for '${locale}'`);
    }
  });

  const modelType = 'translation';
  const items = await client.items.list({ filter: { 
    type: modelType, 
    fields: {
      key: {
        eq: key,
      },
    },
  } });

  const isExistingItem = items.length > 0;
  if (isExistingItem) {
    const item = items[0];
    console.log(`Translation already exists for'${key}' already exists.`);
    return item;
  }

  const model = await client.itemTypes.find(modelType);
  const newItem = await client.items.create({
    item_type: { type: 'item_type', id: model.id },
    key,
    value,
  });
  console.log(`Translation added for '${key}'.`);

  return newItem;
}
