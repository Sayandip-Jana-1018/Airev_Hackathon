import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ command, mode }) => {
  // Load environment variables based on `mode`
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      nodePolyfills(), // Node.js polyfills to avoid "process is not defined" issues
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        process: "process/browser", // Alias to support process in the browser
      },
    },
    base: "./",
  };
});
