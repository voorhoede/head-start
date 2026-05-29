import { getEntry } from '~/lib/content';

async function load() {
  const entry = await getEntry('App', 'default', null);
  if (!entry) throw new Error('App entry not found');
  return entry.data;
}

export type App = Awaited<ReturnType<typeof load>>;

let cache: Promise<App> | undefined;

export async function getApp(): Promise<App> {
  if (!cache) cache = load();
  return cache;
}

export default getApp;
