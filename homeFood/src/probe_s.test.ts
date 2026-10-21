import { describe, it, expect } from 'vitest';
describe('p', () => { it('schemas', async () => { const m = await import('@jest/schemas'); expect(m).toBeDefined(); }); });
