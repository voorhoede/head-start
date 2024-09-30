import { HttpResponse, graphql } from 'msw';

// TODO use content that resembles datocms content
const posts = [
  {
    userId: 1,
    id: 1,
    title: 'Hello World',
    body: 'It\'s a beautiful day today.',
  },
];

const handlers = [
  graphql.query('SingleRecord', () => {
    return HttpResponse.json({
      data: { posts },
    });
  }),
];

export default handlers;
