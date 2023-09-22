type DatocmsRequestType = {
  query: string;
  variables?: { [key: string]: string };
};

export const datocmsRequest = ({ query, variables = {} }: DatocmsRequestType) => {
  return fetch('https://graphql.datocms.com/', {
    method: 'post',
    headers: {
      Authorization: import.meta.env.DATOCMS_READONLY_API_TOKEN,
      'Content-Type': 'application/json',
      'X-Environment': import.meta.env.DATOCMS_ENVIRONMENT,
      'X-Exclude-Invalid': 'true', // https://www.datocms.com/docs/content-delivery-api/api-endpoints#strict-mode-for-non-nullable-graphql-types
      // "X-Include-Drafts": preview ? "true" : "false",
    },
    body: JSON.stringify({ query, variables }),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.errors) throw Error(JSON.stringify(response, null, 4))
      return response.data;
    })
}
