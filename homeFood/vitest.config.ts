import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  oxc: {
    jsx: {
      runtime: 'automatic',
    },
  },
  server: {
    deps: {
      inline: [/@testing-library\/react-native/, 'test-renderer', 'react-reconciler'],
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/*.test.{ts,tsx}',
      'app/**/*.test.{ts,tsx}',
    ],
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 10000,
    css: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'react-native': path.resolve(__dirname, 'test/react-native-mock.tsx'),
      'react-native-svg': path.resolve(__dirname, 'test/react-native-svg-mock.tsx'),
      'react-native-keyboard-controller': path.resolve(
        __dirname,
        'test/react-native-keyboard-controller-mock.tsx',
      ),
      'jest-matcher-utils': path.resolve(
        __dirname,
        'test/jest-matcher-utils-mock.ts',
      ),
      'pretty-format': path.resolve(__dirname, 'node_modules/pretty-format'),
    },
  },
});
