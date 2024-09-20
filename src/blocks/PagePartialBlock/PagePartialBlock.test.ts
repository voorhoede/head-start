import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import PagePartialBlock, { type Props } from './PagePartialBlock.astro';

describe('PagePartialBlock', () => {
  test('Layout Stack, untitled', async () => {
    const fragment = await renderToFragment<Props>(PagePartialBlock, {
      props: {
        block: {
          __typename: 'PagePartialBlockRecord',
          id: 'ay-D0Z1ZTqWVszeV9ZqfJA',
          layout: 'stack-untitled',
          items: [
            {
              title: 'Partial A',
              blocks: [
                {
                  __typename: 'TextBlockRecord',
                  text: {
                    blocks: [],
                    links: [],
                    value: {
                      schema: 'dast',
                      document: {
                        type: 'root',
                        children: [
                          {
                            type: 'paragraph',
                            children: [
                              {
                                type: 'span',
                                value: 'This is a test'
                              },
                            ]
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    });

    expect(fragment.querySelector('h2')).toBeFalsy();
    expect(fragment.querySelector('p')).toBeTruthy();
  });

  test('Layout Stack, titled', async () => {
    const fragment = await renderToFragment<Props>(PagePartialBlock, {
      props: {
        block: {
          __typename: 'PagePartialBlockRecord',
          id: 'ay-D0Z1ZTqWVszeV9ZqfJA',
          layout: 'stack-titled',
          items: [
            {
              title: 'Partial A',
              blocks: [
                {
                  __typename: 'TextBlockRecord',
                  text: {
                    blocks: [],
                    links: [],
                    value: {
                      schema: 'dast',
                      document: {
                        type: 'root',
                        children: [
                          {
                            type: 'paragraph',
                            children: [
                              {
                                type: 'span',
                                value: 'This is a test'
                              },
                            ]
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    });

    expect(fragment.querySelector('h2')).toBeTruthy();
    expect(fragment.querySelector('p')).toBeTruthy();
  });

  test('Layout Accordion, closed', async () => {
    const fragment = await renderToFragment<Props>(PagePartialBlock, {
      props: {
        block: {
          __typename: 'PagePartialBlockRecord',
          id: 'ay-D0Z1ZTqWVszeV9ZqfJA',
          layout: 'accordion-closed',
          items: [
            {
              title: 'Partial A',
              blocks: [
                {
                  __typename: 'TextBlockRecord',
                  text: {
                    blocks: [],
                    links: [],
                    value: {
                      schema: 'dast',
                      document: {
                        type: 'root',
                        children: [
                          {
                            type: 'paragraph',
                            children: [
                              {
                                type: 'span',
                                value: 'This is a test'
                              },
                            ]
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    });

    expect(fragment.querySelector('details')).toBeTruthy();
    expect(fragment.querySelector('details[open]')).toBeFalsy();
  });

  test('Layout Accordion, open', async () => {
    const fragment = await renderToFragment<Props>(PagePartialBlock, {
      props: {
        block: {
          __typename: 'PagePartialBlockRecord',
          id: 'ay-D0Z1ZTqWVszeV9ZqfJA',
          layout: 'accordion-open',
          items: [
            {
              title: 'Partial A',
              blocks: [
                {
                  __typename: 'TextBlockRecord',
                  text: {
                    blocks: [],
                    links: [],
                    value: {
                      schema: 'dast',
                      document: {
                        type: 'root',
                        children: [
                          {
                            type: 'paragraph',
                            children: [
                              {
                                type: 'span',
                                value: 'This is a test'
                              },
                            ]
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    });

    expect(fragment.querySelector('details[open]')).toBeTruthy();
  });

  test('Layout Tabs', async () => {
    const fragment = await renderToFragment<Props>(PagePartialBlock, {
      props: {
        block: {
          __typename: 'PagePartialBlockRecord',
          id: 'ay-D0Z1ZTqWVszeV9ZqfJA',
          layout: 'tabs',
          items: [
            {
              title: 'Partial A',
              blocks: [
                {
                  __typename: 'TextBlockRecord',
                  text: {
                    blocks: [],
                    links: [],
                    value: {
                      schema: 'dast',
                      document: {
                        type: 'root',
                        children: [
                          {
                            type: 'paragraph',
                            children: [
                              {
                                type: 'span',
                                value: 'This is a test'
                              },
                            ]
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    });

    expect(fragment.querySelector('tabs-component')).toBeTruthy();
    expect(fragment.querySelector('tabs-tab[role="heading"]')?.textContent).toContain('Partial A');
    expect(fragment.querySelector('tabs-panel[role="region"] p')?.textContent).toContain('This is a test');
  });
});
