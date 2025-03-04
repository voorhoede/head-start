import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv-safe';
import { buildClient } from '@datocms/cma-client-node';
import { fromMarkdown } from 'mdast-util-from-markdown';
import type { Root } from 'mdast';
import { toHast } from 'mdast-util-to-hast';
import { hastToStructuredText, type HastRootNode } from 'datocms-html-to-structured-text';
import { validate } from 'datocms-structured-text-utils';
import { visit } from 'unist-util-visit';
import { datocmsEnvironment } from '../../../datocms-environment';

const rootDir = path.resolve(__dirname, '../../../');

dotenv.config({
  path: path.resolve(rootDir, '.env'),
  sample: path.resolve(rootDir, '.env.example'),
  allowEmptyValues: Boolean(process.env.CI),
});

const client = buildClient({
  apiToken: process.env.DATOCMS_API_TOKEN!,
  environment: datocmsEnvironment,
});
const docExtension = '.md';
const docDirectory = path.resolve(rootDir,'docs/');
const modelType = 'page';
const documentationSlug = 'documentation';
const mainBranchUrl = 'https://github.com/voorhoede/head-start/tree/main/';

async function listDocs() {
  const filenames = await readdir(docDirectory);
  return filenames.filter(file  => file.endsWith(docExtension));
}

async function readDoc(filename: string) {
  const filepath = path.join(docDirectory, filename);
  const contents = await readFile(filepath, 'utf-8');
  const titlePattern = /^# .*\n/;
  const title = contents.match(titlePattern)?.[0].replace(/^# /, '').trim() ?? '';
  const text = contents.replace(titlePattern, '')?.trim() ?? '';
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
  const note = `!Note: this page is auto-generated from [docs/${document.slug}.md](${mainBranchUrl}docs/${document.slug}.md).`;
  const markdown = `${note}\n\n${document.text}`;
  const structuredText = await markdownToStructuredText(markdown);
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
      type: modelType,
      fields: {
        slug: { eq: slug },
      }
    },
  });
  return items[0];
}

async function upsertDocumentationPartialRecord(documents: Document[]) {
  const title = 'Documentation index';
  const itemType = 'page_partial';
  const model = await client.itemTypes.find(itemType);
  const items = await client.items.list({
    nested: true,
    filter: {
      type: itemType,
      fields: {
        title: { eq: title },
      }
    },
  });
  const record = items[0];

  const markdown = documents.map(doc => {
    return `* [${doc.title}](/en/${documentationSlug}/${doc.slug}/)`;
  }).join('\n');
  const structuredText = await markdownToStructuredText(markdown);
  const textBlockItemType = await client.itemTypes.find('text_block');

  const data = {
    item_type: { type: 'item_type' as const, id: model.id },
    title: { en: title },
    blocks: {
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

  if (record) {
    await client.items.update(record.id, { ...record, ...data });
  } else {
    await client.items.create(data);
  }
  console.log('✨', record ? 'updated' : 'created', 'page partial:', title);
}

async function getDocumentationRecord() {
  const page = await findRecordBySlug(documentationSlug);
  if (page) {
    console.log('✅ documentation page already exists');
    return page;
  }

  console.log('✨ creating new documentation page');
  const model = await client.itemTypes.find(modelType);
  return await upsertRecord({ model, document: { 
    slug: documentationSlug, 
    title: 'Documentation', 
    text: ''
  } });
}

/**
 * adapted from https://www.datocms.com/docs/structured-text/migrating-content-to-structured-text#migrating-markdown-content
 */
async function markdownToStructuredText(markdown: string) {
  const mdast = fromMarkdown(markdown);
  resolveLinks(mdast);
  const hast = toHast(mdast) as HastRootNode;
  const structuredText = await hastToStructuredText(hast);
  const validationResult = validate(structuredText);
  if (!validationResult.valid) {
    throw new Error(validationResult.message);
  }
  return structuredText;
}

function resolveLinks (mdast: Root) {
  visit(mdast, 'link', (node) => {
    if (node.url.startsWith('./') && node.url.includes('.md')) {
      node.url = node.url
        .replace('./', '../')
        .replace('.md', '/');
    } else if (node.url.startsWith('../')) {
      node.url = node.url.replace('../', mainBranchUrl);
    }
  });
}

async function seedDocs() {
  const filenames = await listDocs();
  const model = await client.itemTypes.find(modelType);
  const parent = await getDocumentationRecord();
  const documents: Document[] = [];
  for (const filename of filenames) {
    const document = await readDoc(filename);
    documents.push(document);
    await upsertRecord({ model, document, parent });
  }
  await upsertDocumentationPartialRecord(documents);
}

seedDocs()
  .then(() => console.log('✅ Docs seeded'));
