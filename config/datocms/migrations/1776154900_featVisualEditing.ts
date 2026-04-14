import { Client } from '@datocms/cli/lib/cma-client-node';

// Visual editing runs against the `preview` branch deployment, which is where
// draft mode is enabled. 
const siteUrl = 'https://preview.head-start.pages.dev';
const token = process.env.HEAD_START_PREVIEW_SECRET || 'REPLACE_WITH_PREVIEW_SECRET';

export default async function (client: Client) {
  console.log('Install plugin "Web Previews"');
  await client.plugins.create({
    id: 'e6BF2jyuTVayi8iwES86Hw',
    package_name: 'datocms-plugin-web-previews',
  });
  await client.plugins.update('e6BF2jyuTVayi8iwES86Hw', {
    parameters: {
      frontends: [
        {
          name: 'Preview',
          disabled: false,
          customHeaders: [],
          visualEditing: {
            initialPath: '',
            enableDraftModeUrl: `${siteUrl}/api/draft-mode/enable?token=${token}`,
          },
          previewWebhook: `${siteUrl}/api/preview-links?token=${token}`,
        },
      ],
      startOpen: false,
      defaultViewports: [
        { icon: 'mobile-alt', name: 'Mobile', width: 375, height: 667 },
        { icon: 'tablet-alt', name: 'Tablet', width: 768, height: 1024 },
        { icon: 'desktop-alt', name: 'Desktop', width: 1280, height: 800 },
      ],
      defaultSidebarWidth: '900',
      previewLinksSidebarDisabled: false,
      previewLinksSidebarPanelDisabled: false,
    },
  });
}
