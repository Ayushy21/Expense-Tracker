import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Backend port: 3002 by default (avoids conflict with other apps on 3001)
const API_PORT = process.env.VITE_API_PORT || '3002';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${API_PORT}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
