# React Real-Time Updates — `useQuerySubscription`

React hook for live content updates via DatoCMS's [Real-time Updates API](https://www.datocms.com/docs/real-time-updates-api/api-reference). Receives updated query results in real-time over Server-Sent Events (SSE) and reconnects automatically on network failures.

See `realtime-concepts.md` for shared initialization options, connection status values, error object shape, and the `fetcher` gotcha.

## Basic Usage

```jsx
import { useQuerySubscription } from 'react-datocms';

function App() {
  const { status, error, data } = useQuerySubscription({
    query: `
      query {
        allBlogPosts {
          slug
          title
        }
      }
    `,
    token: 'YOUR_API_TOKEN',
  });

  const statusMessage = {
    connecting: 'Connecting to DatoCMS...',
    connected: 'Connected to DatoCMS, receiving live updates!',
    closed: 'Connection closed',
  };

  return (
    <div>
      <p>Connection status: {statusMessage[status]}</p>
      {error && (
        <div>
          <h1>Error: {error.code}</h1>
          <div>{error.message}</div>
          {error.response && (
            <pre>{JSON.stringify(error.response, null, 2)}</pre>
          )}
        </div>
      )}
      {data && (
        <ul>
          {data.allBlogPosts.map((blogPost) => (
            <li key={blogPost.slug}>{blogPost.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Hook Signature

```ts
const {
  data: QueryResult | undefined,
  error: ChannelErrorData | null,
  status: ConnectionStatus,
} = useQuerySubscription(options);
```

## Initialization Options

See `realtime-concepts.md` for the full options table shared across all frameworks.

## Connection Status

See `realtime-concepts.md` for connection status values.

## Error Object

See `realtime-concepts.md` for the error object shape.

## Integration with Draft Mode

When used in a draft mode context, pass the relevant options:

```jsx
const { data } = useQuerySubscription({
  query: QUERY,
  token: draftModeToken,
  includeDrafts: true,
  excludeInvalid: true,
  // For Content Link (visual editing):
  contentLink: 'v1',
  baseEditingUrl: 'https://your-project.admin.datocms.com/environments/main',
  // Server-fetched data as initial render:
  initialData: serverData,
});
```

## Critical: The `fetcher` Gotcha

See `realtime-concepts.md` for the general rule. In React, define `fetcher` as a `const` outside the component function to avoid infinite render loops.
