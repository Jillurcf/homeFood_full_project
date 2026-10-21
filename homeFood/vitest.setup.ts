// This file runs before each test file.
// It sets up global mocks and polyfills needed for React Native testing.

import { vi } from "vitest";

// React Native / Expo globals injected by the native runtime.
(globalThis as any).__DEV__ = true;
(globalThis as any).global = globalThis;
(globalThis as any).requestAnimationFrame =
  (globalThis as any).requestAnimationFrame ||
  ((cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 0));
(globalThis as any).cancelAnimationFrame =
  (globalThis as any).cancelAnimationFrame || ((id: number) => clearTimeout(id));

// expo-secure-store is a native module with no implementation under vitest.
// Provide an in-memory stand-in so stores/slices can be imported.
const secureStoreMemory = new Map<string, string>();
vi.mock("expo-secure-store", () => ({
  default: {
    setItemAsync: vi.fn(async (key: string, value: string) => {
      secureStoreMemory.set(key, value);
    }),
    getItemAsync: vi.fn(async (key: string) =>
      secureStoreMemory.has(key) ? secureStoreMemory.get(key)! : null,
    ),
    deleteItemAsync: vi.fn(async (key: string) => {
      secureStoreMemory.delete(key);
    }),
  },
  setItemAsync: vi.fn(async (key: string, value: string) => {
    secureStoreMemory.set(key, value);
  }),
  getItemAsync: vi.fn(async (key: string) =>
    secureStoreMemory.has(key) ? secureStoreMemory.get(key)! : null,
  ),
  deleteItemAsync: vi.fn(async (key: string) => {
    secureStoreMemory.delete(key);
  }),
}));
