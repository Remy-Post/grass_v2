import { describe, expect, test } from 'vitest';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { Reveal, RevealItem } from '../components/shared/Reveal.js';
import { PerspectiveCard } from '../components/shared/PerspectiveCard.js';
import { LenisProvider } from '../components/shared/LenisProvider.js';
import {
  FOOTER_DOT_GRID_COLUMNS,
  FOOTER_DOT_GRID_ROWS,
  FooterDotGrid,
} from '../components/shared/FooterDotGrid.js';
import { TransformationSlider } from '../components/home/TransformationSlider.js';
import { BeforeAfter } from '../components/services/BeforeAfter.js';

describe('Client components — SSR safety', () => {
  test('Reveal wraps children without throwing', () => {
    const html = renderToString(
      createElement(Reveal, {
        preset: 'fade',
        children: createElement('p', null, 'hello'),
      }),
    );
    expect(html).toContain('hello');
  });

  test('Reveal stagger preset accepts RevealItem children', () => {
    const html = renderToString(
      createElement(Reveal, {
        preset: 'stagger',
        children: [
          createElement(RevealItem, { key: 'a', children: 'one' }),
          createElement(RevealItem, { key: 'b', children: 'two' }),
        ],
      }),
    );
    expect(html).toContain('one');
    expect(html).toContain('two');
  });

  test.each(['div', 'section', 'article', 'header', 'ul', 'ol', 'li'] as const)(
    'Reveal renders with as="%s"',
    (tag) => {
      const html = renderToString(
        createElement(Reveal, { as: tag, preset: 'rise', children: 'inner-' + tag }),
      );
      expect(html).toContain('inner-' + tag);
    },
  );

  test.each(['div', 'li', 'article', 'section'] as const)(
    'RevealItem renders with as="%s"',
    (tag) => {
      const html = renderToString(
        createElement(RevealItem, { as: tag, children: 'item-' + tag }),
      );
      expect(html).toContain('item-' + tag);
    },
  );

  test('PerspectiveCard renders children server-side', () => {
    const html = renderToString(
      createElement(PerspectiveCard, null, createElement('span', null, 'card-content')),
    );
    expect(html).toContain('card-content');
  });

  test('LenisProvider passes children through with wrapper', () => {
    const html = renderToString(
      createElement(LenisProvider, null, createElement('p', null, 'inside')),
    );
    expect(html).toContain('inside');
    expect(html).toContain('data-lenis-root');
  });

  test('FooterDotGrid renders the default desktop dot grid', () => {
    const html = renderToString(createElement(FooterDotGrid));
    const matches = html.match(/class="footer-dot"/g) ?? [];
    expect(matches.length).toBe(FOOTER_DOT_GRID_COLUMNS.desktop * FOOTER_DOT_GRID_ROWS);
  });

  test('FooterDotGrid omits the old local-only caption', () => {
    const html = renderToString(createElement(FooterDotGrid));
    expect(html).not.toContain('Local-only. Bradford and West Gwillimbury.');
  });

  test('TransformationSlider renders before/after labels', () => {
    const html = renderToString(
      createElement(TransformationSlider, {
        beforeLabel: 'Before-test',
        afterLabel: 'After-test',
      }),
    );
    expect(html).toContain('Before-test');
    expect(html).toContain('After-test');
  });

  test('Services BeforeAfter renders labels and image paths', () => {
    const html = renderToString(
      createElement(BeforeAfter, {
        alt: 'Service comparison',
        beforeSrc: '/images/services/missing-before.png',
        afterSrc: '/images/services/missing-after.png',
        beforeLabel: 'Rough',
        afterLabel: 'Clean',
      }),
    );

    expect(html).toContain('Rough');
    expect(html).toContain('Clean');
    expect(html).toContain('Service comparison');
  });
});
