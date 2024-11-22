import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config({
  allowEmptyValues: Boolean(process.env.CI),
});

const client = buildClient({
  apiToken: process.env.DATOCMS_API_TOKEN!,
  environment: datocmsEnvironment,
});
const docExtension = '.md';
const docDirectory = './docs';
const modelType = 'page';

async function listDocs() {
  const filenames = await readdir(docDirectory);
  return filenames.filter(file  => file.endsWith(docExtension));
}

async function readDoc(filename: string) {
  const filepath = path.join(docDirectory, filename);
  const contents = await readFile(filepath, 'utf-8');
  const title = contents.split('\n')[0].replace(/^# /, '').trim();
  const text = contents.replace(/^# .*\n/, '').trim();
  const slug = path.basename(filename, docExtension);
  return { slug, title, text };
}

type Model = {
  id: string;
}
type Document = {
  slug: string;
  title: string;
  text: string;
}
async function createRecord ({ model, document, parent }: { model: Model, document: Document }) {
  const record = await client.items.create({
    item_type: { type: 'item_type', id: model.id },
    title: { en: document.title },
    slug: { en: document.slug },
    parent_page: parent.id,
  });
  await client.items.publish(record.id);
  return record;
}

async function findRecordBySlug (slug: string) {
  const items = await client.items.list({
    filter: {
      type: 'page',
      fields: {
        slug: { eq: slug },
      }
    },
  });
  return items[0];
}

/**
 * Load all docs/*.md files into the CMS
 * - uses the filename as the slug
 * - uses the first line as the title
 * - uses the rest of the file as the text
 * - creates a new record if one doesn't exist
 * - updates the record if it does exist
 */
async function seedDocs() {
  // const filenames = ['accessibility.md'];
  const filenames = await listDocs();
  const model = await client.itemTypes.find(modelType);
  const parent = await findRecordBySlug('documentation');
  console.log({ filenames });

  for (const filename of filenames) {
    const slug = path.basename(filename, docExtension);
    const record = await findRecordBySlug(slug);
    const document = await readDoc(filename);
    if (record) {
      // todo: update it?
      console.log('found record', slug, record?.title);
    } else {
      console.log(document.title);
      await createRecord({ model, document, parent });
    }
  }
}

seedDocs()
  .then(() => console.log('Docs seeded'));
