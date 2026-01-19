import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
     VITE_API_URL: "http://localhost/api"
    }
  },
  server: {
    port:80,
    proxy: {
      // Proxy requests starting with '/api' to a backend server at localhost:5000
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true, // Changes the origin header to the target URL
        // rewrite: (path) => path.replace(/^\/api/, '') // Removes the /api prefix
      }
    }
  }
})
