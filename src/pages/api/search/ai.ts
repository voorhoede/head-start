import type { APIRoute } from 'astro';
// import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/hf_transformers';
// import { LibSQLVectorStore } from '@langchain/community/vectorstores/libsql';
import { createClient } from '@libsql/client/web';

export const prerender = false;

const jsonResponse = (data: object, status: number = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const GET: APIRoute = async ({ request }) => {
  const params = Object.fromEntries(new URL(request.url).searchParams.entries()) as { query: string };

  const queryParamName = 'query';
  const query = params[queryParamName];

  if (!query) {
    return jsonResponse({ error: `Missing '${queryParamName}' parameter` }, 400);
  }

  try {
    const dbUrl = new URL('/docs.db', request.url).toString();
    console.log('dbUrl', dbUrl);
    const db = await createClient({
      url: dbUrl,
      // encryptionKey: process.env.ENCRYPTION_KEY,
    });
    const entry = await db.execute('PRAGMA table_info(docs)');
    console.log('entry', entry);
    return jsonResponse({ query });
  } catch (error) {
    console.error('Error searching', error);
    return jsonResponse({ error: 'Error searching' }, 500);
  }
};
