import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
    alias: {
      '@unissey-web/sdk-react': fileURLToPath(new URL('./src/test/sdkReactMock.tsx', import.meta.url)),
    },
  },
});
