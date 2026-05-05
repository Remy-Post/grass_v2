import { describe, expect, test } from 'vitest';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import {
  HERO_DOT_GRID_COLUMNS,
  HERO_DOT_GRID_ROWS,
  HERO_DOT_GRID_SHAPES,
  HeroGrass,
  buildHeroShapeMask,
} from '../components/home/HeroGrass.js';

describe('HeroGrass SSR', () => {
  test('renders the footer-style dot grid server-side', () => {
    const html = renderToString(createElement(HeroGrass));
    expect(html).toContain('hero-dot-grid');
    expect(html).not.toContain('<svg');
  });

  test('renders all hero dots on desktop default', () => {
    const html = renderToString(createElement(HeroGrass));
    const matches = html.match(/data-hero-dot="\d+"/g) ?? [];
    expect(matches.length).toBe(HERO_DOT_GRID_COLUMNS.desktop * HERO_DOT_GRID_ROWS);
  });

  test('renders the dot interaction hint label', () => {
    const html = renderToString(createElement(HeroGrass));
    expect(html).toMatch(/Move your cursor|Dot preview|Tap and watch/);
  });

  test.each(HERO_DOT_GRID_SHAPES)('%s gardening mask uses meaningful hero space', (shape) => {
    const mask = buildHeroShapeMask(shape);
    let lit = 0;
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === 1) lit++;
    }

    expect(lit).toBeGreaterThanOrEqual(mask.length * 0.08);
  });

  test.each(HERO_DOT_GRID_SHAPES)('%s gardening mask is centered in the hero grid', (shape) => {
    for (const colCount of Object.values(HERO_DOT_GRID_COLUMNS)) {
      const cols: number = colCount;
      const rows: number = HERO_DOT_GRID_ROWS;
      const mask = buildHeroShapeMask(shape, cols, rows);
      let minCol: number = cols;
      let maxCol = -1;
      let minRow: number = rows;
      let maxRow = -1;

      for (let i = 0; i < mask.length; i++) {
        if (mask[i] !== 1) continue;

        const col = i % cols;
        const row = Math.floor(i / cols);
        minCol = Math.min(minCol, col);
        maxCol = Math.max(maxCol, col);
        minRow = Math.min(minRow, row);
        maxRow = Math.max(maxRow, row);
      }

      const gridColCenter = (cols - 1) / 2;
      const gridRowCenter = (rows - 1) / 2;
      const maskColCenter = (minCol + maxCol) / 2;
      const maskRowCenter = (minRow + maxRow) / 2;

      expect(Math.abs(maskColCenter - gridColCenter)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(maskRowCenter - gridRowCenter)).toBeLessThanOrEqual(0.5);
    }
  });

  test('tulip mask is rotated upright with its larger bloom above the stem', () => {
    const cols: number = HERO_DOT_GRID_COLUMNS.desktop;
    const rows: number = HERO_DOT_GRID_ROWS;
    const mask = buildHeroShapeMask('tulip', cols, rows);
    let upperThird = 0;
    let lowerThird = 0;

    for (let i = 0; i < mask.length; i++) {
      if (mask[i] !== 1) continue;

      const row = Math.floor(i / cols);
      if (row < rows / 3) upperThird++;
      if (row > (rows * 2) / 3) lowerThird++;
    }

    expect(upperThird).toBeGreaterThan(lowerThird);
  });

  test('does not render placeholder gradient text from old hero', () => {
    const html = renderToString(createElement(HeroGrass));
    expect(html).not.toContain('Mockup until real Bradford yard photos exist');
  });
});
