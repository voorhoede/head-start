import type { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Install plugin "Web Previews"');

  const existingPlugins = await client.plugins.list();
  let plugin = existingPlugins.find(
    (p) => p.package_name === 'datocms-plugin-web-previews',
  );

  if (!plugin) {
    plugin = await client.plugins.create({
      package_name: 'datocms-plugin-web-previews',
    });
    console.log('Web Previews plugin installed. Configure the frontend URLs in DatoCMS plugin settings (see docs/preview-mode.md).');
  } else {
    console.log('Web Previews plugin already installed.');
  }
}
