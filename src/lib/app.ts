import { getEntry } from '~/lib/content';

const entry = await getEntry('App', 'default');

if (!entry) throw new Error('App entry not found');

export type App = typeof entry.data;
export const app: App = entry.data;
export default app;