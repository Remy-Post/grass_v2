'use client';

import { useState } from 'react';
import type { Faq } from '@lawnguy/brand';
import { getNextOpenFaqSlugs } from './faq-open-state';

type FaqAccordionItem = Pick<Faq, 'slug'> & {
  data: Pick<Faq['data'], 'question' | 'answer'>;
};

type Props = {
  items: FaqAccordionItem[];
};

export function FaqAccordionClient({ items }: Props) {
  const [openSlugs, setOpenSlugs] = useState<string[]>([]);

  return (
    <ul className="mt-8 divide-y divide-line rounded-xl border border-line bg-bg">
      {items.map((faq) => {
        const isOpen = openSlugs.includes(faq.slug);

        return (
          <li key={faq.slug}>
            <details className="group" open={isOpen}>
              <summary
                className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium text-ink [&::-webkit-details-marker]:hidden"
                onClick={(event) => {
                  event.preventDefault();
                  setOpenSlugs((current) => getNextOpenFaqSlugs(current, faq.slug));
                }}
              >
                <span>{faq.data.question}</span>
                <span
                  aria-hidden
                  className="grid h-7 w-7 place-items-center rounded-full bg-surface-alt text-ink-muted transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="px-5 pb-5 text-ink-soft">{faq.data.answer}</div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}
