export const datocmsRequest = ({ query, variables = {}, preview = false }) => {
  const endpoint = preview
    ? "https://graphql.datocms.com/preview"
    : "https://graphql.datocms.com/"

  return fetch(endpoint, {
    method: "post",
    headers: {
      Authorization: import.meta.env.DATOCMS_READONLY_API_TOKEN,
      "Content-Type": "application/json",
      "X-Environment": import.meta.env.DATOCMS_DEFAULT_ENVIRONMENT,
      "X-Exclude-Invalid": "true", // https://www.datocms.com/docs/content-delivery-api/api-endpoints#strict-mode-for-non-nullable-graphql-types
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

/**
 * Returns a DatoCMS subscription
 * token is only exposed when app is in preview mode
 */
export const datocmsSubscription = async ({
  query,
  variables = {},
  preview = false,
}) => {
  const initialData = await datocmsRequest({ query, variables, preview })
  return {
    query,
    variables,
    preview,
    initialData,
    enabled: preview,
    token: preview && process.env.DATOCMS_READONLY_API_TOKEN,
  }
}
