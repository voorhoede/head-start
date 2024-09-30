import { afterAll, afterEach, beforeAll, describe, test } from 'vitest';
import { setupServer } from 'msw/node';
// import { parse } from 'graphql/language';
// import { datocmsRequest } from './datocms';
import handlers from './datocms.mock';

// note: the queries are not actually used as we mock the requests, but the parser (from graphql/language) will throw an error if you do not include some kind of query
// const SingleRecordQuery = parse(`
//   query SingleRecord {
//     id
//   }
// `);

const server = setupServer(...handlers);

/**
 * Things to test:
 *
 * datocmsRequest:
 * - should successfully fetch data
 * - should throw an error if the response is not 'ok'
 * - should retry if it hits a rate-limit error
 * - should retry if it hits a rate-limit error and return data if it succeeds
 * - should retry if it hits a rate-limit error and throw an error if it takes more than 5 tries
 * - should include drafts in response if HEAD_START_PREVIEW is set and truthy
 *
 */

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('datocms: "datocmsRequest"', () => {
  test('should successfully fetch data', async () => {
    // const response = await datocmsRequest({ query: SingleRecordQuery });
    // console.log(response);
    // TODO add expect()
  });
});
