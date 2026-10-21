import { describe, it, expect } from 'vitest';
describe('probe4', () => { it('imports pure', async () => {
  const m = await import('@testing-library/react-native/pure');
  expect(m).toBeDefined();
}); });
