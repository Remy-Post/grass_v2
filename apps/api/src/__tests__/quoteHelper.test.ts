import { describe, expect, test } from 'vitest';
import {
  advance,
  openingReply,
  isOutOfArea,
  INITIAL_FLOW_STATE,
} from '../services/quoteHelper.js';

describe('quoteHelper state machine', () => {
  test('opening greeting starts at "location"', () => {
    const r = openingReply();
    expect(r.flowState.step).toBe('location');
    expect(r.done).toBe(false);
    expect(r.reply.toLowerCase()).toContain('bradford');
  });

  test('advances through all five questions', () => {
    let state = INITIAL_FLOW_STATE;

    let r = advance(state, 'Yes Bradford');
    expect(r.flowState.step).toBe('service_need');
    state = r.flowState;

    r = advance(state, 'Mowing');
    expect(r.flowState.step).toBe('cadence');
    state = r.flowState;

    r = advance(state, 'Weekly');
    expect(r.flowState.step).toBe('yard_state');
    state = r.flowState;

    r = advance(state, 'Normal');
    expect(r.flowState.step).toBe('contact_handoff');
    expect(r.done).toBe(true);
  });

  test('out-of-area answer ends conversation early', () => {
    const r = advance(INITIAL_FLOW_STATE, 'No, I am in Toronto');
    expect(r.flowState.step).toBe('done');
    expect(r.done).toBe(true);
    expect(r.reply.toLowerCase()).toContain('bradford');
  });

  test('NEVER quotes a price in any reply', () => {
    let state = INITIAL_FLOW_STATE;
    const replies: string[] = [];
    for (const answer of ['Yes', 'Mowing', 'Weekly', 'Normal']) {
      const r = advance(state, answer);
      replies.push(r.reply);
      state = r.flowState;
    }
    const all = replies.join('\n').toLowerCase();
    expect(all).not.toMatch(/\$\d+/);
    expect(all).not.toContain('cost is');
    expect(all).not.toContain('starting at');
  });

  test('NEVER claims insurance, license, or pesticide treatments', () => {
    let state = INITIAL_FLOW_STATE;
    const replies: string[] = [];
    for (const answer of ['Yes', 'Mowing', 'Weekly', 'Normal']) {
      const r = advance(state, answer);
      replies.push(r.reply);
      state = r.flowState;
    }
    const all = replies.join('\n').toLowerCase();
    expect(all).not.toMatch(/fully insured/);
    expect(all).not.toMatch(/licensed (pesticide|applicator|exterminator)/);
    expect(all).not.toContain('we spray weeds');
    expect(all).not.toContain('grub control available');
    expect(all).not.toContain('pest control treatment');
  });

  test('isOutOfArea recognizes common out-of-area cities', () => {
    expect(isOutOfArea('No, I am in Toronto')).toBe(true);
    expect(isOutOfArea('Newmarket')).toBe(true);
    expect(isOutOfArea('barrie')).toBe(true);
    expect(isOutOfArea('Yes, in Bradford')).toBe(false);
    expect(isOutOfArea('Bradford ON')).toBe(false);
  });

  test('answers are accumulated across the flow', () => {
    let state = INITIAL_FLOW_STATE;
    state = advance(state, 'Yes').flowState;
    state = advance(state, 'Mowing and edging').flowState;
    state = advance(state, 'Biweekly').flowState;
    state = advance(state, 'Overgrown').flowState;
    expect(state.answers).toMatchObject({
      location: 'Yes',
      service_need: 'Mowing and edging',
      cadence: 'Biweekly',
      yard_state: 'Overgrown',
    });
  });
});
