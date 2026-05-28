import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';

dotenv.config();

export const getProjectName = async (): Promise<string> => {
  const client = buildClient({ apiToken: process.env.DATOCMS_READONLY_API_TOKEN! });
  const project = await client.publicInfo.find();
  return project.name;
};