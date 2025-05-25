import { Client, } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Manage upload filters');

  console.log('Install plugin "Translate"');
  const translatePlugin = await client.plugins.create({
    package_name: 'datocms-plugin-translate-fields',
  });
  await client.plugins.update(translatePlugin.id, {
    parameters: {
      autoApply: false, // Let users choose when to apply the translation
      excludedKeys: 'theme, variant, style, layout, action, key',
    },
  });
}
