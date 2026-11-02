import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Proxy /api to the Express server on the same PORT it reads from .env
  const env = loadEnv(mode, process.cwd(), '');
  const apiPort = env.PORT || '5000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: { '/api': `http://localhost:${apiPort}` }
    }
  };
});
