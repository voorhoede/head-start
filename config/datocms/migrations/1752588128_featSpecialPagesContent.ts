import { Client } from '@datocms/cli/lib/cma-client-node';

/**
 * Migrates the special pages from singleton items to page records.
 * 
 * @returns A promise that resolves to an array of singleton models to delete.
 */
export default async function (client: Client) {
  console.log(
    'Migrating "\uD83C\uDFE0 Home" (`home_page`) and "\uD83E\uDD37 Not Found" (`not_found_page`) singletons to "\uD83D\uDCD1 Page" (`page`)'
  );
  const locales = await client.site.find().then(site => site.locales);

  const appSettingsModel = await client.itemTypes.find('app');
  const homePageModel = await client.itemTypes.find('home_page');
  const notFoundPageModel = await client.itemTypes.find('not_found_page');
  const pageModel = await client.itemTypes.find('page');

  if (!appSettingsModel.singleton_item) {
    throw new Error('"\uD83D\uDDA5\uFE0F Website" (`app`) singleton not found');
  }
  if (!homePageModel.singleton_item) {
    throw new Error('"\uD83C\uDFE0 Home" (`home_page`) singleton not found');
  }
  if (!notFoundPageModel.singleton_item) {
    throw new Error('"\uD83E\uDD37 Not Found" (`not_found_page`) singleton not found');
  }

  const lastPublishedHomePageRecord = await client.items.find(
    homePageModel.singleton_item?.id,
    { nested: true, version: 'published' }
  );
  const lastPublishedNotFoundPageRecord = await client.items.find(
    notFoundPageModel.singleton_item?.id,
    { nested: true, version: 'published' }
  );

  /**
   * Replaces references to the old id with the new id in the content of a record.
   */
  function replaceReferences<T extends Record<string, unknown>>(
    record: T,
    oldId: string,
    newId: string,
  ): T {
    return JSON.parse(
      JSON.stringify(processContent(record)).replaceAll(oldId, newId)
    );
  }

  /**
   * Processes content from one record to insert into another record.
   * This function will recursively traverse the content object, to remove the 
   * ids of any encoutered blocks.
   */
  function processContent(content: Record<string, unknown>) {
    for (const key in content) {
      if (typeof content[key] === 'object' && content[key] !== null) {
        if (isLocalizedField(content[key])) {
          for (const locale in content[key]) {
            content[key][locale] = processField(content[key][locale]);
          }
        }
      }
    }
    return content;
  }

  function isLocalizedField(field: unknown): field is Record<string, unknown> {
    return !!field
      && typeof field === 'object'
      && Object.keys(field).every((key) => locales.includes(key));
  }

  /**
   * Recursively processes a field, removing ids for insertion.
   */
  function processField(field: unknown): unknown {
    if (field && typeof field === 'object') {
      if (Array.isArray(field)) {
        return field.map(processField);
      }
      let fieldValue = field as Record<string, unknown>;
      // Remove 'id' and 'type' properties if they exist and type is not 'item_type'
      if ('id' in field && 'type' in field && field.type !== 'item_type') {
        const { id, ...rest } = field;
        fieldValue = rest;
      }
      for (const key in fieldValue) {
        fieldValue[key] = processField(fieldValue[key]);
      }
      return fieldValue;
    }
    return field;
  }

  const [home_page, not_found_page] = await Promise.all([
    { record: lastPublishedHomePageRecord, slug: 'home' },
    { record: lastPublishedNotFoundPageRecord, slug: 'not-found' },
  ].map(async ({ record, slug }) => {
    const { id, type, item_type, meta, creator, ...rest } = record;
    console.log(`Migrating ${type} to Page record with slug "${slug}"`);
    const localizedSlug = locales
      .reduce((acc, locale) => ({
        ...acc,
        [locale]: slug,
      }), {} as Record<typeof locales[number], string>);

    // Insert the new Page record
    return client.items.create({
      ...processContent(rest),
      creator,
      item_type: { type: 'item_type', id: pageModel.id },
      slug: locales.length > 1
        ? localizedSlug
        : localizedSlug[locales[0]],
    })
      // Publish the new Page record
      .then(async ({ id }) => (await client.items.publish(id)))
      // Update the new Page with original's most recent unpublished version
      .then(async (page) => {
        const lastSavedSingletonRecord = await client.items.find(record.id, { nested: true, version: 'current' });
        const { id, type, item_type, meta, creator, ...rest } = lastSavedSingletonRecord;
        if (meta.status !== 'published') {
          client.items.update(page.id, processContent(rest));
        }
        return page;
      })
      // return the id of the new Page record
      .then(({ id }) => id);
  }));

  console.log(
    'Insert migrated pages into "\uD83D\uDDA5\uFE0F Website" (`app`)'
  );
  const { id, meta: { status } } = await client.items.find(appSettingsModel.singleton_item?.id);
  const isPreMigrationAppSettingsPublished = status === 'published';
  await client.items.update(appSettingsModel.singleton_item?.id, {
    home_page,
    not_found_page,
  });
  if (isPreMigrationAppSettingsPublished) {
    console.log('Publish updated "\uD83D\uDDA5\uFE0F Website" (`app`)');
    await client.items.publish(id);
  }

  if (!homePageModel.singleton_item?.id) {
    throw new Error('Home page model does not have a singleton item');
  }

  console.log(
    'Updating records linking to "\uD83C\uDFE0 Home" (`home_page`)'
  );
  const recordsReferencingHomePage = await client.items.references(
    homePageModel.singleton_item.id,
    { nested: true },
  );

  for (const record of recordsReferencingHomePage) {
    const { id, type, item_type, meta, creator, ...content } = record;
    const title = isLocalizedField(content.title)
      ? content.title[locales[0]]
      : content.title;
    console.log(`Updating record "${title || id}"`);
    await client.items.update(
      record.id,
      replaceReferences(content, homePageModel.singleton_item.id, home_page),
    );
  }

  console.log(
    'Updating records linking to "\uD83E\uDD37 Not found" (`not_found_page`)'
  );
  const recordsReferencingNotFoundPage = await client.items.references(
    homePageModel.singleton_item.id,
    { nested: true },
  );

  for (const record of recordsReferencingNotFoundPage) {
    const { id, type, item_type, meta, creator, ...content } = record;
    const title = isLocalizedField(content.title)
      ? content.title[locales[0]]
      : content.title;
    console.log(`Updating record "${title || id}"`);
    await client.items.update(
      record.id,
      replaceReferences(content, notFoundPageModel.singleton_item.id, not_found_page),
    );
  }

  console.log('Delete model "\uD83C\uDFE0 Home" (`home_page`)');
  await client.itemTypes.destroy(homePageModel.id);

  console.log('Delete model "\uD83E\uDD37 Not found" (`not_found_page`)');
  await client.itemTypes.destroy(notFoundPageModel.id);
}
