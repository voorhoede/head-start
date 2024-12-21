import type { Client } from '@datocms/cli/lib/cma-client-node';

export const createPreviewToken = async (client: Client) => {
  const roles = await client.roles.list();
  const editorRole = roles.find((role) => role.name === 'Editor');

  return client.accessTokens.create({
    name: 'Preview',
    can_access_cda: true,
    can_access_cda_preview: false,
    can_access_cma: true,
    role: {
      type: 'role',
      id: editorRole!.id,
    },
  });
};
