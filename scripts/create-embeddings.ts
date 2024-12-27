import path from 'node:path';
import type { Document } from 'langchain/document';
import { MultiFileLoader } from 'langchain/document_loaders/fs/multi_file';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/hf_transformers';
import { LibSQLVectorStore } from '@langchain/community/vectorstores/libsql';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { createClient } from '@libsql/client';
import glob from 'tiny-glob';

const loadDocs = async () => {
  // https://js.langchain.com/docs/integrations/document_loaders/file_loaders/multi_file/
  const filenames = await glob('docs/*.md');
  const loader = new MultiFileLoader(filenames, { 
    '.md': (path) => new TextLoader(path),
  });
  const docs = await loader.load();
  return docs.map(doc => ({
    ...doc,
    // @todo: maybe replace metadata.source with the relative path instead?
    id: path.relative(path.join(__dirname,'../'), doc.metadata.source),
  }));
};

const splitDocs = async (docs: Document[]) => {
  // https://js.langchain.com/docs/how_to/code_splitter/#markdown
  const splitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
    chunkSize: 200, // @todo: figure out the best chunk size
    chunkOverlap: 0,
  });
  const out = await Promise.all(
    docs.map(async (doc) => {
      const chunks = await splitter.createDocuments([doc.pageContent]);
      return chunks.map((chunk) => ({
        ...chunk,
        metadata: { ...doc.metadata, ...chunk.metadata },
      }));
    })
  );
  return out.flat();
};

const createDatabase = async () => {
  // https://js.langchain.com/docs/integrations/vectorstores/libsql/#setup-the-table-and-index
  // https://github.com/tursodatabase/libsql-client-ts?tab=readme-ov-file#quickstart
  const db = createClient({
    url: 'file:public/docs.db',
    // encryptionKey: process.env.ENCRYPTION_KEY,
  });
  await db.execute(/* sql */`
    CREATE TABLE IF NOT EXISTS docs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        metadata TEXT,
        embedding F32_BLOB(384)
    );
  `);
  await db.execute(/* sql */`
      CREATE INDEX IF NOT EXISTS idx_docs_embedding ON docs(libsql_vector_idx(embedding));
  `);
  return db;
};

const storeDocs = async (docs: Document[]) => {
  // https://js.langchain.com/docs/integrations/vectorstores/libsql/#instantiation
  const db = await createDatabase();
  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: 'Xenova/all-MiniLM-L6-v2',
  });
  const vectorStore = new LibSQLVectorStore(embeddings, {
    db,
    table: 'docs',
    column: 'embedding',
  });
  await vectorStore.addDocuments(docs);
};

loadDocs()
  .then(docs => splitDocs(docs))
  .then(docs => storeDocs(docs))
  .then(() => console.log('✅ Created database ./docs.db'));
