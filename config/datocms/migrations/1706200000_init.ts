import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Update environment\'s settings');
  await client.site.update({
    locales: ['en'],
    timezone: 'Europe/Amsterdam',
  });

  console.log('Install plugin "Table Editor"');
  await client.plugins.create({
    package_name: 'datocms-plugin-table-editor',
  });

  console.log('Install plugin "OEmbed (embed anything)"');
  await client.plugins.create({
    package_name: 'datocms-plugin-oembed',
  });

  console.log('Install plugin "Translate"');
  const translatePlugin = await client.plugins.create({
    package_name: 'datocms-plugin-translate-fields',
  });
  if (process.env.DEEPL_API_KEY) {
    await client.plugins.update(translatePlugin.id, {
      parameters: {
        autoApply: true,
        deeplApiKey: process.env.DEEPL_API_KEY,
        translationService: { label: 'DeepL API Pro', value: 'deepl' }
      },
    });
  }
}
