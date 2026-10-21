import { describe, it, expect } from 'vitest';
describe('probe2', () => { it('imports store', async () => {
  const m = await import('./store');
  expect(m.store).toBeDefined();
}); });
