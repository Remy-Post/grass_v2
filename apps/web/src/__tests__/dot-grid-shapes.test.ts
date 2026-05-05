import { describe, expect, test } from 'vitest';
import {
  FOOTER_DOT_GRID_COLUMNS,
  FOOTER_DOT_GRID_ROWS,
  FOOTER_DOT_GRID_SHAPES,
  buildShapeMask,
} from '../components/shared/FooterDotGrid.js';

const TOTAL = FOOTER_DOT_GRID_COLUMNS.desktop * FOOTER_DOT_GRID_ROWS;

describe('FooterDotGrid shape masks', () => {
  test.each(FOOTER_DOT_GRID_SHAPES)(
    '%s mask is a Uint8Array of size %i',
    (name) => {
      const mask = buildShapeMask(name);
      expect(mask).toBeInstanceOf(Uint8Array);
      expect(mask.length).toBe(TOTAL);
    },
  );

  test.each(FOOTER_DOT_GRID_SHAPES)(
    '%s mask values are 0 or 1 only',
    (name) => {
      const mask = buildShapeMask(name);
      for (let i = 0; i < mask.length; i++) {
        expect(mask[i] === 0 || mask[i] === 1).toBe(true);
      }
    },
  );

  test.each(FOOTER_DOT_GRID_SHAPES)(
    '%s mask has at least 8 lit dots',
    (name) => {
      const mask = buildShapeMask(name);
      let lit = 0;
      for (let i = 0; i < mask.length; i++) {
        if (mask[i] === 1) lit++;
      }
      expect(lit).toBeGreaterThanOrEqual(8);
    },
  );

  test.each([
    ['desktop', FOOTER_DOT_GRID_COLUMNS.desktop],
    ['tablet', FOOTER_DOT_GRID_COLUMNS.tablet],
    ['mobile', FOOTER_DOT_GRID_COLUMNS.mobile],
  ] as const)('%s mask uses the configured responsive column count', (_, cols) => {
    const mask = buildShapeMask('heart', cols);
    expect(mask.length).toBe(cols * FOOTER_DOT_GRID_ROWS);
  });
});
