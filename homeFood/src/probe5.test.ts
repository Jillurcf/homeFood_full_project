import { describe, it, expect } from 'vitest';
describe('probe5', () => { it('imports test-renderer', async () => {
  const m = await import('test-renderer');
  expect(m).toBeDefined();
}); });
