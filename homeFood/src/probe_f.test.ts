import { describe, it, expect } from 'vitest';
describe('p', () => { it('loads wait-for', async () => { const m = await import('@testing-library/react-native/dist/wait-for.js'); expect(m).toBeDefined(); }); });
