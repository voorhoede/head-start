import type { SiteLocale } from '~/lib/datocms/schema';
import { getEntry } from '~/lib/content';
import { getLocale } from '~/lib/i18n';

/**
 * Returns the App entry (website settings, menu, site data) for the given locale,
 * including its preview mode subscription.
 */
export async function getAppEntry(locale: SiteLocale = getLocale()) {
  const entry = await getEntry('App', 'default', locale);
  if (!entry) throw new Error(`App entry not found for locale "${locale}"`);
  return entry;
}

export type App = Awaited<ReturnType<typeof getAppEntry>>['data'];

export async function getApp(locale?: SiteLocale): Promise<App> {
  const entry = await getAppEntry(locale);
  return entry.data;
}

export default getApp;
