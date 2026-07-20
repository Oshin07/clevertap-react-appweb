import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/clevertap-react-appweb/',
  server: {
    port: 5173
  }
});
