import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Safely replace process.env.API_KEY with the actual string value during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill the remaining process.env object to an empty object to prevent ReferenceError
      'process.env': JSON.stringify({}),
    },
  };
});