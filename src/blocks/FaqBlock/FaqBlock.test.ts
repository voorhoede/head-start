import { renderToFragment } from '~/lib/renderer';
import { describe, expect, test } from 'vitest';
import FaqBlock, { type Props } from './FaqBlock.astro';

const ACCORDION_ITEM_RECORD = 'AccordionItemRecord' as const;
const TEXT_BLOCK_RECORD = 'TextBlockRecord' as const;

const textBlock = (value: string) => ({
  __typename: TEXT_BLOCK_RECORD,
  text: {
    blocks: [],
    inlineBlocks: [],
    links: [],
    value: {
      schema: 'dast',
      document: {
        type: 'root',
        children: [
          { type: 'paragraph', children: [{ type: 'span', value }] },
        ],
      },
    },
  },
});

const faqItem = (slug: string, question: string, answer: string) => ({
  id: slug,
  slug,
  questionAndAnswer: { __typename: ACCORDION_ITEM_RECORD, title: question, blocks: [textBlock(answer)] },
});

describe('FaqBlock', () => {
  const renderBlock = () => renderToFragment<Props>(FaqBlock, {
    props: {
      block: {
        __typename: 'FaqBlockRecord',
        id: 'faq-block-1',
        groupTitle: 'Frequently asked questions',
        questionAndAnswers: [
          faqItem('question-a', 'Question A', 'Answer A'),
          faqItem('question-b', 'Question B', 'Answer B'),
        ],
      },
    },
  });

  test('renders the group title as a heading', async () => {
    const fragment = await renderBlock();
    expect(fragment.querySelector('h2')?.textContent).toBe('Frequently asked questions');
  });

  test('renders each linked question as an accordion item', async () => {
    const fragment = await renderBlock();
    const summaries = [...fragment.querySelectorAll('summary')].map(s => s.textContent?.trim());
    expect(fragment.querySelectorAll('details').length).toBe(2);
    expect(summaries?.[0]).toContain('Question A');
    expect(summaries?.[1]).toContain('Question B');
  });

  test('renders the answer body of a linked question', async () => {
    const fragment = await renderBlock();
    expect(fragment.textContent).toContain('Answer A');
  });

  test('exposes each question by its slug for deep-linking', async () => {
    const fragment = await renderBlock();
    expect(fragment.querySelector('details#question-a')).toBeTruthy();
    expect(fragment.querySelector('details#question-b')).toBeTruthy();
  });
});
