import { describe, it, expect } from 'vitest';
import React from 'react';
const X = () => <div />;
describe('probe', () => { it('ok', () => { expect(typeof X).toBe('function'); }); });
