import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port: 5173,
      proxy: {
        // Forwards /api/* to the backend in dev, so no CORS setup is needed.
        '/api': {
          target: env.API_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
          // Skips ngrok's browser warning page when the backend is exposed via ngrok.
          headers: { 'ngrok-skip-browser-warning': 'true' },
        },
      },
    },
  };
});
