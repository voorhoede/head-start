import type { Client } from '@datocms/cli/lib/cma-client-node';

export const createPreviewToken = async (client: Client) => {
  // Check if a token named "Preview" already exists
  const existingTokens = await client.accessTokens.list();
  const existingPreviewToken = existingTokens.find((token) => token.name === 'Preview');
  
  if (existingPreviewToken) {
    return existingPreviewToken;
  }

  // Create new token if it doesn't exist
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
