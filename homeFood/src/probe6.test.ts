import { describe, it, expect } from 'vitest';
describe('probe6', () => { it('jm', async () => {
  const m = await import('jest-matcher-utils');
  expect(typeof m.matcherHint).toBe('function');
}); });
