import type { Client } from '@datocms/cli/lib/cma-client-node';
import pkg from '../../../package.json';

const siteUrl = process.env.HEAD_START_SITE_URL || `https://${pkg.name}.pages.dev`;
const editorGuidePath = '/cms/editor-guide/';

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
      pageName: '',
      pageEmbedUrl: '',
      pages: [
        {
          pageName: 'Guide',
          iconName: 'book',
          pageEmbedUrl: `${siteUrl}${editorGuidePath}`,
          pageType: { value: 'mainNavigationTabs', label: 'Top menu' },
          placement: { value: 'after', label: 'After menu item' },
          menuItemPlacement: { value: 'configuration', label: 'Configuration' },
        },
      ],
    },
  });
}
