import { describe, it, expect } from 'vitest';
describe('probe3', () => { it('imports rtl', async () => {
  const m = await import('@testing-library/react-native');
  expect(m.render).toBeDefined();
}); });
