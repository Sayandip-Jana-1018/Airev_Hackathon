import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      url: 'native-url', // or 'url-polyfill'
      // Add other aliases as needed
    },
  },
  define: {
    'process.env': {}, // Mock process.env for compatibility
  },
});
