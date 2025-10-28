import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // 백엔드 주소/포트에 맞춰 변경
        changeOrigin: true,
        secure: false,
      },
    },
  },
})