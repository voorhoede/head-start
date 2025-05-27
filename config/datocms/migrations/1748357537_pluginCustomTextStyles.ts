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
          id: 'paragraph-centered',
          css: 'text-align: center;',
          node: { label: 'Paragraph', value: 'paragraph' },
          slug: 'centered',
          title: 'Centered',
          isOpen: true,
        },
        {
          id: 'heading-centered',
          css: 'text-align: center;',
          node: { label: 'Heading', value: 'heading' },
          slug: 'centered',
          title: 'Centered',
          isOpen: true,
        },
      ],
    },
  });
}
