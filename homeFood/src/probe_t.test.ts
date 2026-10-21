import { describe, it, expect } from 'vitest';
describe('probe', () => { it('imports picocolors', async () => { const m = await import('picocolors'); expect(m).toBeDefined(); }); });
