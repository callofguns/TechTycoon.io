import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project at /TechTycoon.io/ (not the site root),
  // so the built files need every path prefixed with that. The local dev
  // server should keep running at the root though, so `npm run dev` still
  // just opens at http://localhost:5173/ like normal.
  base: command === 'build' ? '/TechTycoon.io/' : '/',
  plugins: [react()],
  server: {
    host: true, // so the dev server is reachable from a phone on the same network
  },
}));
