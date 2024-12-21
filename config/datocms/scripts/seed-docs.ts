import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv-safe';
import { buildClient } from '@datocms/cma-client-node';
import { markdownToStructuredText } from '../lib/markdownToStructuredText';
import { datocmsEnvironment } from '../../../datocms-environment';

dotenv.config({
  allowEmptyValues: Boolean(process.env.CI),
});

const client = buildClient({
  apiToken: process.env.DATOCMS_API_TOKEN!,
  environment: datocmsEnvironment,
});
const docExtension = '.md';
const docDirectory = path.resolve(__dirname,'../../../docs');
const modelType = 'page';

async function listDocs() {
  const filenames = await readdir(docDirectory);
  return filenames.filter(file  => file.endsWith(docExtension));
}

async function readDoc(filename: string) {
  const filepath = path.join(docDirectory, filename);
  const contents = await readFile(filepath, 'utf-8');
  const title = contents.split('\n')[0].replace(/^# /, '').trim();
  // naive text cleanup:
  const text = contents
    .replace(/^# .*\n/, '') // remove title
    .replace('](../', '](https://github.com/voorhoede/head-start/tree/main/') // fix relative links
    .replace(/]\(\.\/([^)]*)\.md/g, (match, p1) => `](../${p1}/`) // remove .md from ](./*.md) links
    .trim();
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
type Page = {
  id: string;
  [key: string]: unknown;
}
async function upsertRecord ({ model, document, parent }: { model: Model, document: Document, parent?: Page }) {
  const record = await findRecordBySlug(document.slug);
  const structuredText = await markdownToStructuredText(document.text, {});
  const textBlockItemType = await client.itemTypes.find('text_block');

  const data = {
    item_type: { type: 'item_type' as const, id: model.id },
    title: { en: document.title },
    slug: { en: document.slug },
    parent_page: parent?.id,
    body_blocks: {
      en: [
        {
          type: 'item',
          attributes: {
            text: structuredText,
          },
          relationships: {
            item_type: { 
              data: { 
                type: 'item_type', 
                id: textBlockItemType.id
              }
            },
          }
        }
      ],
    }
  };

  const newRecord = record
    ? await client.items.update(record.id, { ...record, ...data })
    : await client.items.create(data);
  await client.items.publish(newRecord.id);
  console.log('✨', record ? 'updated' : 'created', document.title);
  return newRecord;
}

async function findRecordBySlug (slug: string) {
  const items = await client.items.list({
    nested: true,
    filter: {
      type: 'page',
      fields: {
        slug: { eq: slug },
      }
    },
  });
  return items[0];
}

async function seedDocs() {
  const filenames = ['blocks-and-components.md'];
  // const filenames = await listDocs();
  const model = await client.itemTypes.find(modelType);
  const parent = await findRecordBySlug('documentation');
  console.log({ filenames });
  console.log('todo, use for all docs', await listDocs());

  for (const filename of filenames) {
    const document = await readDoc(filename);
    await upsertRecord({ model, document, parent });
  }
}

seedDocs()
  .then(() => console.log('✅ Docs seeded'));
