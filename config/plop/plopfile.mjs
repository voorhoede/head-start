/**
 * Using .mjs because unlike the documentation leads you to believe, Plop doesn't support TypeScript yet.
 * @see https://github.com/plopjs/plop/issues/297
 *
 * @param {import('plop').NodePlopAPI} plop
 */
export default function (plop) {
  plop.setHelper('hasRouteLocale', (value) => value.includes('[locale]/'));
  plop.setHelper('routeParams', (value) => {
    // return all params in between [] in value:
    // e.g. [locale]/search/[query] => ['query']
    const params = value.match(/\[(.*?)\]/g) || [];
    return params
      .map((param) => param.slice(1, -1)) // remove brackets
      .filter((param) => param !== 'locale'); // remove locale param
  });
  plop.setHelper('trailingSlash', (value) =>
    value.endsWith('/') ? value : `${value}/`
  );

  plop.setGenerator('api', {
    description: 'create a new API route',
    prompts: [
      {
        type: 'input',
        name: 'route',
        message: 'API route (e.g. demo/[param] )?',
      },
    ],
    actions: [
      {
        type: 'add',
        path: '../../src/pages/api/{{ route }}.ts.hbs',
        templateFile: 'templates/api/route.ts',
      },
    ],
  });

  plop.setGenerator('block', {
    description: 'create a new Block component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Block name (e.g. TextBlock)?',
      },
      {
        type: 'confirm',
        name: 'readme',
        message: 'Add README.md file?',
        default: false,
      },
    ],
    actions: [
      {
        type: 'add',
        path: '../../src/blocks/{{ pascalCase name }}/{{ pascalCase name }}.astro',
        templateFile: 'templates/block/Block.astro.hbs',
      },
      {
        type: 'add',
        path: '../../src/blocks/{{ pascalCase name }}/{{ pascalCase name }}.fragment.graphql',
        templateFile: 'templates/block/Block.fragment.graphql.hbs',
      },
      {
        type: 'add',
        path: '../../src/blocks/{{ pascalCase name }}/README.md',
        templateFile: 'templates/block/README.md.hbs',
        skip: (data) => !data.readme && 'No README.md file',
      },
    ],
  });

  plop.setGenerator('component', {
    description: 'create a new UI component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (e.g. ShareButton)?',
      },
      {
        type: 'confirm',
        name: 'script',
        message: 'Add client-side script? (*.client.ts)?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'customElement',
        message: 'Add custom element?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'readme',
        message: 'Add README.md file?',
        default: false,
      },
    ],
    actions: [
      {
        type: 'add',
        path: '../../src/components/{{ pascalCase name }}/{{ pascalCase name }}.astro',
        templateFile: 'templates/component/Component.astro.hbs',
      },
      {
        type: 'add',
        path: '../../src/components/{{ pascalCase name }}/{{ pascalCase name }}.client.ts',
        templateFile: 'templates/component/Component.client.ts.hbs',
        skip: (data) => !data.script && 'No client-side script',
      },
      {
        type: 'add',
        path: '../../src/components/{{ pascalCase name }}/README.md',
        templateFile: 'templates/component/README.md.hbs',
        skip: (data) => !data.readme && 'No README.md file',
      },
    ],
  });

  plop.setGenerator('page', {
    description: 'create a new Page route',
    prompts: [
      {
        type: 'input',
        name: 'route',
        message: 'Page route (e.g. [locale]/search/ )?',
      },
      {
        type: 'input',
        name: 'name',
        message: 'Model name in DatoCMS? (leave empty if none)',
      },
    ],
    actions: [
      {
        type: 'add',
        path: '../../src/pages/{{ trailingSlash route }}index.astro',
        templateFile: 'templates/page/route.astro.hbs',
      },
      {
        type: 'add',
        path: '../../src/pages/{{ trailingSlash route }}_index.query.graphql',
        templateFile: 'templates/page/route.query.graphql.hbs',
        skip: (data) => !data.name && 'No DatoCMS model',
      },
    ],
  });
}
