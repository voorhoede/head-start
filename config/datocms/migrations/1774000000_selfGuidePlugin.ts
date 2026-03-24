import type { Client } from '@datocms/cli/lib/cma-client-node';
import pkg from '../../../package.json';

const siteUrl = `https://${pkg.name}.pages.dev`;

export default async function (client: Client) {
  console.log('Install plugin "Custom Page"');

  const existingPlugins = await client.plugins.list();
  let plugin = existingPlugins.find((p) => p.package_name === 'datocms-plugin-custom-page');

  if (!plugin) {
    plugin = await client.plugins.create({
      package_name: 'datocms-plugin-custom-page',
    });
  }

  await client.plugins.update(plugin.id, {
    parameters: {
      pages: [
        {
          pageName: 'Guide',
          iconName: 'book',
          pageEmbedUrl: `${siteUrl}/self-guide/`,
          pageType: 'MainNavigationTabs',
          placement: 'After',
          menuItemPlacement: 'Configuration',
        },
      ],
    },
  });
}
