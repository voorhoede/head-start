import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function (client: Client) {
  console.log('Manage upload filters');

  console.log('Install plugin "Custom Text Styles"');
  
  const pluginCustomTextStyles = await client.plugins.create({
    package_name: 'datocms-plugin-custom-text-styles',
  });
  await client.plugins.update(pluginCustomTextStyles.id, {
    parameters: {
      customStyles: [
        {
          css: 'text-align: center;',
          slug: 'centered',
          nodes: [
            { label: 'Paragraph', value: 'paragraph' },
            { label: 'Heading', value: 'heading' },
          ],
          title: 'Centered',
          isOpen: true,
        },
      ],
    },
  });
}
