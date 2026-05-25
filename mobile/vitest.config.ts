import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts', '**/__tests__/**/*.test.ts'],
    exclude: ['node_modules', '.expo', 'dist'],
    coverage: {
      reporter: ['text', 'html', 'json-summary'],
      include: ['services/**', 'hooks/**', 'lib/**'],
      exclude: ['**/__tests__/**'],
    },
  },
  resolve: {
    alias: {
      // Stub react-native + expo modules in tests; pure functions only.
      'react-native': new URL('./test-mocks/react-native.ts', import.meta.url).pathname,
      'expo-location': new URL('./test-mocks/expo-location.ts', import.meta.url).pathname,
      'expo-secure-store': new URL('./test-mocks/expo-secure-store.ts', import.meta.url).pathname,
      'expo-task-manager': new URL('./test-mocks/expo-task-manager.ts', import.meta.url).pathname,
    },
  },
});
