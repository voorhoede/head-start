import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/hf_transformers';
import { LibSQLVectorStore } from '@langchain/community/vectorstores/libsql';
import { createClient } from '@libsql/client';

const loadVectorStore = async () => {
  const db = createClient({
    url: 'file:public/docs.db',
    // encryptionKey: process.env.ENCRYPTION_KEY,
  });
  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: 'Xenova/all-MiniLM-L6-v2',
  });
  const vectorStore = new LibSQLVectorStore(embeddings, {
    db,
    table: 'docs',
    column: 'embedding',
  });
  return vectorStore;
};

const queryDocs = async (query: string, limit = 3) => {
  const vectorStore = await loadVectorStore();
  const results = await vectorStore.similaritySearchWithScore(query, limit);
  return results;
};

queryDocs('Accessibility').then(console.log);

// const logDoc = async (id: number) => {
//   const db = createClient({
//     url: 'file:docs.db',
//     // encryptionKey: process.env.ENCRYPTION_KEY,
//   });
//   const entry = await db.execute(/* sql */`SELECT * FROM docs WHERE id = 1`);
//   console.log(entry);
// };

// logDoc(1);
