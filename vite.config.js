import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5050,
    proxy: {
      '/api': {
        target: 'http://localhost:8070',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:8070',
        changeOrigin: true,
        secure: false,
      },
      '/v3/api-docs': {
        target: 'http://localhost:8070',
        changeOrigin: true,
      },
      '/swagger-ui': {
        target: 'http://localhost:8070',
        changeOrigin: true,
      }
    }
  }
});
