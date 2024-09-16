# Testing

Head Start utilises testing to ensure the quality of the codebase and to prevent regressions. This helps developers to build with confidence which is especially important with a project that is developed and maintained by multiple developers. The CI pipeline will run the tests automatically on every push to the repository.

We use [vitest](https://vitest.dev/) to run our tests. Vitests is configurable through its config (vitest.config.ts) and automatically finds test files to run if they follow the `<filename>.test.ts` naming convention.

## Unit Testing

We use unit testing to test individual library functions and components. Our setup uses `vitest` for running test and [msw](https://mswjs.io/) for mocking network requests.

You can run the unit tests with the following command:

```bash
npm run test:unit
```

NOTE: not all unit test have been added at the time of writing this.

## e2e Testing

We plan to add this in the future.

